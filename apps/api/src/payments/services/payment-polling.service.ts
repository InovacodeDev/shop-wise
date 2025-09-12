import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PaymentPollingStatus, PaymentPollingStatusDocument } from '../schemas/payment-polling-status.schema';
import { StripeTransaction, StripeTransactionDocument } from '../schemas/stripe-transaction.schema';
import { PaymentsService } from './payments.service';

@Injectable()
export class PaymentPollingService {
    private readonly logger = new Logger(PaymentPollingService.name);
    private pollingInterval: NodeJS.Timeout | null = null;
    private readonly defaultPollIntervalMs: number;
    private readonly maxRetries: number;
    private readonly pollingTimeoutMs: number;
    private isPolling = false;

    constructor(
        @InjectModel(PaymentPollingStatus.name)
        private readonly paymentPollingModel: Model<PaymentPollingStatusDocument>,
        @InjectModel(StripeTransaction.name)
        private readonly stripeTransactionModel: Model<StripeTransactionDocument>,
        private readonly paymentsService: PaymentsService,
        private readonly configService: ConfigService,
    ) {
        this.defaultPollIntervalMs = this.configService.get<number>('PAYMENT_POLL_INTERVAL', 30000); // 30 seconds
        this.maxRetries = this.configService.get<number>('PAYMENT_MAX_RETRIES', 5);
        this.pollingTimeoutMs = this.configService.get<number>('PAYMENT_POLL_TIMEOUT', 1800000); // 30 minutes
    }

    /**
     * Start the background polling service
     */
    startPolling(): void {
        if (this.isPolling) {
            this.logger.warn('Polling service is already running');
            return;
        }

        this.logger.log('Starting payment polling service');
        this.isPolling = true;

        // Start the polling loop
        this.pollingInterval = setInterval(() => {
            void this.pollPendingTransactions();
        }, this.defaultPollIntervalMs);

        this.logger.log(`Payment polling service started with interval: ${this.defaultPollIntervalMs}ms`);
    }

    /**
     * Stop the background polling service
     */
    stopPolling(): void {
        if (!this.isPolling) {
            this.logger.warn('Polling service is not running');
            return;
        }

        this.logger.log('Stopping payment polling service');
        this.isPolling = false;

        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }

        this.logger.log('Payment polling service stopped');
    }

    /**
     * Poll all pending transactions
     */
    private async pollPendingTransactions(): Promise<void> {
        try {
            // Find all active polling records that need to be polled
            const activePollingRecords = await this.paymentPollingModel
                .find({
                    polling_active: true,
                    $or: [{ next_poll_at: { $lte: new Date() } }, { next_poll_at: { $exists: false } }],
                })
                .limit(50) // Process in batches to avoid overwhelming the system
                .exec();

            if (activePollingRecords.length === 0) {
                return;
            }

            this.logger.log(`Polling ${activePollingRecords.length} pending transactions`);

            // Process each polling record
            const pollingPromises = activePollingRecords.map((pollingRecord) =>
                this.processPollingRecord(pollingRecord),
            );

            await Promise.allSettled(pollingPromises);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Error in polling loop: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
        }
    }

    /**
     * Process a single polling record
     */
    private async processPollingRecord(pollingRecord: PaymentPollingStatusDocument): Promise<void> {
        try {
            const transactionId = pollingRecord.transaction_id.toString();

            // Check if transaction has exceeded timeout
            const transaction = await this.stripeTransactionModel.findById(transactionId).exec();
            if (!transaction) {
                this.logger.warn(`Transaction not found for polling record: ${transactionId}`);
                await this.stopPollingRecord(pollingRecord._id, 'Transaction not found');
                return;
            }

            // Check timeout
            const timeElapsed = Date.now() - transaction.createdAt.getTime();
            if (timeElapsed > this.pollingTimeoutMs) {
                this.logger.log(`Transaction ${transactionId} exceeded polling timeout`);
                await this.stopPollingRecord(pollingRecord._id, 'Polling timeout exceeded');
                return;
            }

            // Update transaction status from Stripe
            const updated = await this.paymentsService.getPaymentStatus(transaction.userId, transactionId);

            // Check if transaction is in a final state
            if (this.isFinalStatus(updated.status)) {
                this.logger.log(`Transaction ${transactionId} reached final status: ${updated.status}`);
                await this.stopPollingRecord(pollingRecord._id, `Transaction completed with status: ${updated.status}`);
                return;
            }

            // Update polling record with next poll time and reset retry count on success
            const nextPollAt = new Date(Date.now() + (pollingRecord.poll_interval_ms || this.defaultPollIntervalMs));
            await this.paymentPollingModel
                .findByIdAndUpdate(pollingRecord._id, {
                    last_polled_at: new Date(),
                    next_poll_at: nextPollAt,
                    retry_count: 0, // Reset on successful poll
                    last_error: null,
                })
                .exec();

            this.logger.debug(`Successfully polled transaction: ${transactionId}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Error polling transaction ${pollingRecord.transaction_id.toString()}: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );

            // Handle retry logic
            await this.handlePollingError(pollingRecord, errorMessage);
        }
    }

    /**
     * Handle polling errors and retry logic
     */
    private async handlePollingError(pollingRecord: PaymentPollingStatusDocument, errorMessage: string): Promise<void> {
        const newRetryCount = pollingRecord.retry_count + 1;

        if (newRetryCount >= (pollingRecord.max_retries || this.maxRetries)) {
            // Max retries exceeded - stop polling
            this.logger.error(
                `Max retries exceeded for transaction ${pollingRecord.transaction_id.toString()}. Stopping polling.`,
            );
            await this.stopPollingRecord(pollingRecord._id, `Max retries exceeded: ${errorMessage}`);
        } else {
            // Schedule retry with exponential backoff
            const backoffMs = Math.min(
                (pollingRecord.poll_interval_ms || this.defaultPollIntervalMs) * Math.pow(2, newRetryCount),
                300000, // Max 5 minutes
            );
            const nextPollAt = new Date(Date.now() + backoffMs);

            await this.paymentPollingModel
                .findByIdAndUpdate(pollingRecord._id, {
                    retry_count: newRetryCount,
                    last_error: errorMessage,
                    next_poll_at: nextPollAt,
                })
                .exec();

            this.logger.warn(
                `Retry ${newRetryCount}/${
                    pollingRecord.max_retries || this.maxRetries
                } scheduled for transaction ${pollingRecord.transaction_id.toString()} in ${backoffMs}ms`,
            );
        }
    }

    /**
     * Stop polling for a specific record
     */
    private async stopPollingRecord(pollingRecordId: string, reason: string): Promise<void> {
        await this.paymentPollingModel
            .findByIdAndUpdate(pollingRecordId, {
                polling_active: false,
                stopped_at: new Date(),
                stop_reason: reason,
            })
            .exec();
    }

    /**
     * Get polling service status
     */
    getStatus(): {
        isPolling: boolean;
        pollIntervalMs: number;
        maxRetries: number;
        pollingTimeoutMs: number;
    } {
        return {
            isPolling: this.isPolling,
            pollIntervalMs: this.defaultPollIntervalMs,
            maxRetries: this.maxRetries,
            pollingTimeoutMs: this.pollingTimeoutMs,
        };
    }

    /**
     * Force poll a specific transaction
     */
    async forcePoll(transactionId: string): Promise<void> {
        try {
            this.logger.log(`Force polling transaction: ${transactionId}`);

            // Find the transaction to get user ID
            const transaction = await this.stripeTransactionModel.findById(transactionId).exec();
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            await this.paymentsService.getPaymentStatus(transaction.userId, transactionId);
            this.logger.log(`Force poll completed for transaction: ${transactionId}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Force poll failed for transaction ${transactionId}: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw error;
        }
    }

    /**
     * Check if a status is final (no more polling needed)
     */
    private isFinalStatus(status: string): boolean {
        const finalStatuses = ['succeeded', 'failed', 'canceled', 'expired', 'refunded'];
        return finalStatuses.includes(status.toLowerCase());
    }
}
