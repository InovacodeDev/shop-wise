import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';

import { EmailService } from '../../common/email.service';
import { FamilyPlan, UpdateFamilyDto } from '../../families/dto/update-family.dto';
import { FamiliesService } from '../../families/families.service';
import { UsersService } from '../../users/users.service';
import { CreateCheckoutDto } from '../dto/create-checkout.dto';
import { CreateEmbeddedProPlanCheckoutDto } from '../dto/create-embedded-pro-plan-checkout.dto';
import { CreateProPlanCheckoutDto, ProPlanType } from '../dto/create-pro-plan-checkout.dto';
import { CheckoutResponseDto, PaymentStatusResponseDto, UserPaymentListResponseDto } from '../dto/payment-response.dto';
import { PaymentPollingStatus, PaymentPollingStatusDocument } from '../schemas/payment-polling-status.schema';
import { StripeTransaction, StripeTransactionDocument } from '../schemas/stripe-transaction.schema';
import { StripeClientService } from './stripe-client.service';

export enum StripeTransactionStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
    CANCELED = 'canceled',
    EXPIRED = 'expired',
    REFUNDED = 'refunded',
}

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        @InjectModel(StripeTransaction.name)
        private readonly stripeTransactionModel: Model<StripeTransactionDocument>,
        @InjectModel(PaymentPollingStatus.name)
        private readonly paymentPollingModel: Model<PaymentPollingStatusDocument>,
        private readonly stripeClientService: StripeClientService,
        private readonly familiesService: FamiliesService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
        private readonly usersService: UsersService,
    ) {}

    /**
     * Create a pro plan upgrade checkout session
     */
    async createProPlanCheckout(
        userId: string,
        createProPlanDto: CreateProPlanCheckoutDto,
    ): Promise<CheckoutResponseDto> {
        try {
            this.logger.log(`Creating pro plan checkout for user ${userId}`, createProPlanDto);

            // Get the price ID based on plan type
            const priceId = this.getProPlanPriceId(createProPlanDto.planType);

            // Create checkout session with Stripe
            const checkoutSession = await this.stripeClientService.createCheckoutSession({
                priceIds: [priceId],
                customerEmail: createProPlanDto.customerEmail,
                successUrl: createProPlanDto.successUrl,
                cancelUrl: `${this.configService.get('CLIENT_URL')}/payment/cancel`,
                mode: 'payment',
                metadata: {
                    ...createProPlanDto.metadata,
                    userId,
                    planType: createProPlanDto.planType,
                    upgradeType: 'pro-plan',
                },
            });

            // Create local transaction record
            const transaction = new this.stripeTransactionModel({
                stripeTransactionId: checkoutSession.id,
                userId,
                familyId: createProPlanDto.familyId || '',
                type: 'checkout_session',
                status: this.mapStripeStatus(checkoutSession.status || 'open'),
                amount: checkoutSession.amount_total || 0,
                currency: checkoutSession.currency || 'usd',
                customerId: checkoutSession.customer as string,
                customerEmail: createProPlanDto.customerEmail,
                priceId,
                checkoutSessionUrl: checkoutSession.url,
                metadata: {
                    ...createProPlanDto.metadata,
                    userId,
                    planType: createProPlanDto.planType,
                    upgradeType: 'pro-plan',
                },
            });

            const savedTransaction = await transaction.save();
            this.logger.log(`Pro plan transaction created: ${(savedTransaction._id as string).toString()}`);

            // Create polling status record
            const pollingStatus = new this.paymentPollingModel({
                transaction_id: savedTransaction._id,
                polling_active: true,
                retry_count: 0,
                max_retries: 5,
                poll_interval_ms: 30000, // 30 seconds
                next_poll_at: new Date(Date.now() + 30000),
            });

            await pollingStatus.save();
            this.logger.log(
                `Polling status created for pro plan transaction: ${(savedTransaction._id as string).toString()}`,
            );

            return {
                id: (savedTransaction._id as string).toString(),
                url: checkoutSession.url || '',
                status: savedTransaction.status,
                amount: savedTransaction.amount,
                currency: savedTransaction.currency,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
                createdAt: savedTransaction.createdAt.toISOString(),
                metadata: savedTransaction.metadata,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to create pro plan checkout: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw error;
        }
    }

    /**
     * Create an embedded pro plan checkout with credit card processing
     */
    async createEmbeddedProPlanCheckout(
        userId: string,
        createEmbeddedDto: CreateEmbeddedProPlanCheckoutDto,
    ): Promise<{ transactionId: string; clientSecret: string; amount: number; currency: string }> {
        try {
            this.logger.log(`Creating embedded pro plan checkout for user ${userId}`, {
                planType: createEmbeddedDto.planType,
                customerEmail: createEmbeddedDto.customerEmail,
            });

            // Calculate amount for the plan type
            const amount = this.calculatePlanAmount(createEmbeddedDto.planType);

            // Create payment intent with Stripe for embedded checkout
            const paymentIntent = await this.stripeClientService.createPaymentIntent({
                amount,
                currency: 'usd',
                customerEmail: createEmbeddedDto.customerEmail,
                customerName: createEmbeddedDto.customerName,
                billingAddress: createEmbeddedDto.billingAddress,
                metadata: {
                    ...createEmbeddedDto.metadata,
                    userId,
                    planType: createEmbeddedDto.planType,
                    upgradeType: 'pro-plan-embedded',
                },
                paymentMethodTypes: ['card'],
            });

            // Create local transaction record
            const transaction = new this.stripeTransactionModel({
                stripeTransactionId: paymentIntent.id,
                userId,
                familyId: createEmbeddedDto.familyId || '',
                type: 'payment_intent',
                status: this.mapStripeStatus(paymentIntent.status),
                amount,
                currency: 'usd',
                customerId: paymentIntent.customer as string,
                customerEmail: createEmbeddedDto.customerEmail,
                clientSecret: paymentIntent.client_secret,
                billingAddress: createEmbeddedDto.billingAddress,
                metadata: {
                    ...createEmbeddedDto.metadata,
                    userId,
                    planType: createEmbeddedDto.planType,
                    upgradeType: 'pro-plan-embedded',
                    customerName: createEmbeddedDto.customerName,
                },
            });

            const savedTransaction = await transaction.save();
            this.logger.log(`Embedded pro plan transaction created: ${(savedTransaction._id as string).toString()}`);

            // Create polling status record for payment confirmation
            const pollingStatus = new this.paymentPollingModel({
                transaction_id: savedTransaction._id,
                polling_active: true,
                retry_count: 0,
                max_retries: 10,
                poll_interval_ms: 15000, // 15 seconds for embedded payments
                next_poll_at: new Date(Date.now() + 15000),
            });

            await pollingStatus.save();
            this.logger.log(
                `Polling status created for embedded transaction: ${(savedTransaction._id as string).toString()}`,
            );

            return {
                transactionId: (savedTransaction._id as string).toString(),
                clientSecret: paymentIntent.client_secret || '',
                amount,
                currency: 'usd',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to create embedded pro plan checkout: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw error;
        }
    }

    /**
     * Confirm embedded payment
     */
    async confirmEmbeddedPayment(
        userId: string,
        transactionId: string,
        paymentMethodId: string,
    ): Promise<{ success: boolean; status: string; error?: string }> {
        try {
            this.logger.log(`Confirming embedded payment for transaction ${transactionId}`);

            // Find the transaction
            const transaction = await this.stripeTransactionModel.findById(transactionId);
            if (!transaction || transaction.userId !== userId) {
                throw new NotFoundException('Transaction not found');
            }

            // Confirm the payment intent
            const paymentIntent = await this.stripeClientService.confirmPaymentIntent(
                transaction.stripeTransactionId,
                paymentMethodId,
            );

            // Update transaction status
            transaction.status = this.mapStripeStatus(paymentIntent.status);
            transaction.paymentMethodId = paymentMethodId;

            if (paymentIntent.status === 'succeeded') {
                transaction.completedAt = new Date();
                await this.processProPlanUpgrade(userId, transaction);
            }

            await transaction.save();

            return {
                success: paymentIntent.status === 'succeeded',
                status: paymentIntent.status,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to confirm embedded payment: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
            return {
                success: false,
                status: 'failed',
                error: errorMessage,
            };
        }
    }

    /**
     * Create a general checkout session
     */
    async createCheckout(userId: string, createCheckoutDto: CreateCheckoutDto): Promise<CheckoutResponseDto> {
        try {
            this.logger.log(`Creating checkout for user ${userId}`, createCheckoutDto);

            // Create checkout session with Stripe
            const checkoutSession = await this.stripeClientService.createCheckoutSession({
                priceIds: createCheckoutDto.priceIds,
                customerEmail: createCheckoutDto.customerEmail,
                successUrl: createCheckoutDto.successUrl,
                cancelUrl: createCheckoutDto.cancelUrl,
                mode: createCheckoutDto.mode || 'payment',
                metadata: {
                    ...createCheckoutDto.metadata,
                    userId,
                },
            });

            // Create local transaction record
            const transaction = new this.stripeTransactionModel({
                stripeTransactionId: checkoutSession.id,
                userId,
                familyId: createCheckoutDto.familyId || '',
                type: 'checkout_session',
                status: this.mapStripeStatus(checkoutSession.status || 'open'),
                amount: checkoutSession.amount_total || 0,
                currency: checkoutSession.currency || 'usd',
                customerId: checkoutSession.customer as string,
                customerEmail: createCheckoutDto.customerEmail,
                checkoutSessionUrl: checkoutSession.url,
                metadata: {
                    ...createCheckoutDto.metadata,
                    userId,
                },
            });

            const savedTransaction = await transaction.save();
            this.logger.log(`Transaction created: ${(savedTransaction._id as string).toString()}`);

            return {
                id: (savedTransaction._id as string).toString(),
                url: checkoutSession.url || '',
                status: savedTransaction.status,
                amount: savedTransaction.amount,
                currency: savedTransaction.currency,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                createdAt: savedTransaction.createdAt.toISOString(),
                metadata: savedTransaction.metadata,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to create checkout: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw error;
        }
    }

    /**
     * Get payment status
     */
    async getPaymentStatus(userId: string, transactionId: string): Promise<PaymentStatusResponseDto> {
        try {
            this.logger.log(`Getting payment status for transaction ${transactionId}`);

            const transaction = await this.stripeTransactionModel.findById(transactionId);
            if (!transaction || transaction.userId !== userId) {
                throw new NotFoundException('Transaction not found');
            }

            // Get latest status from Stripe
            let stripeObject: Stripe.Checkout.Session | Stripe.PaymentIntent;
            if (transaction.type === 'checkout_session') {
                stripeObject = await this.stripeClientService.getCheckoutSession(transaction.stripeTransactionId);
            } else {
                stripeObject = await this.stripeClientService.getPaymentIntent(transaction.stripeTransactionId);
            }

            // Update local status if needed
            const newStatus = this.mapStripeStatus(stripeObject.status || 'pending');
            if (transaction.status !== newStatus) {
                transaction.status = newStatus;
                if (newStatus === StripeTransactionStatus.SUCCEEDED.toString()) {
                    transaction.completedAt = new Date();
                    // Process upgrade if this is a pro plan purchase
                    if (
                        transaction.metadata?.upgradeType === 'pro-plan' ||
                        transaction.metadata?.upgradeType === 'pro-plan-embedded'
                    ) {
                        await this.processProPlanUpgrade(userId, transaction);
                    }
                }
                await transaction.save();
            }

            return {
                transactionId: (transaction._id as string).toString(),
                stripeTransactionId: transaction.stripeTransactionId,
                status: transaction.status,
                amount: transaction.amount,
                currency: transaction.currency,
                type: transaction.type,
                customerId: transaction.customerId,
                checkoutUrl: transaction.checkoutSessionUrl,
                createdAt: transaction.createdAt.toISOString(),
                completedAt: transaction.completedAt?.toISOString(),
                metadata: transaction.metadata,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to get payment status: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw error;
        }
    }

    /**
     * Get user payment history
     */
    async getUserPayments(userId: string, limit = 10, offset = 0): Promise<UserPaymentListResponseDto> {
        try {
            this.logger.log(`Getting payment history for user ${userId}`);

            const transactions = await this.stripeTransactionModel
                .find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(offset)
                .exec();

            const total = await this.stripeTransactionModel.countDocuments({ userId });

            const payments = transactions.map((transaction) => ({
                transactionId: (transaction._id as string).toString(),
                stripeTransactionId: transaction.stripeTransactionId,
                status: transaction.status,
                amount: transaction.amount,
                currency: transaction.currency,
                type: transaction.type,
                createdAt: transaction.createdAt.toISOString(),
                completedAt: transaction.completedAt?.toISOString(),
                metadata: transaction.metadata,
            }));

            return {
                payments,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total,
                },
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to get user payments: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw error;
        }
    }

    /**
     * Process webhook events from Stripe
     */
    async processWebhookEvent(event: Stripe.Event): Promise<void> {
        try {
            this.logger.log(`Processing webhook event: ${event.type}`);

            switch (event.type) {
                case 'checkout.session.completed':
                    await this.handleCheckoutSessionCompleted(event.data.object);
                    break;
                case 'payment_intent.succeeded':
                    await this.handlePaymentIntentSucceeded(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentIntentFailed(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    this.handleInvoicePaymentSucceeded(event.data.object);
                    break;
                default:
                    this.logger.log(`Unhandled webhook event type: ${event.type}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to process webhook event: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw error;
        }
    }

    /**
     * Handle checkout session completed webhook
     */
    private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
        try {
            this.logger.log(`Handling checkout session completed: ${session.id}`);

            const transaction = await this.stripeTransactionModel.findOne({
                stripeTransactionId: session.id,
            });

            if (!transaction) {
                this.logger.warn(`Transaction not found for checkout session: ${session.id}`);
                return;
            }

            transaction.status = StripeTransactionStatus.SUCCEEDED;
            transaction.completedAt = new Date();

            if (session.customer) {
                transaction.customerId = session.customer as string;
            }

            // Process pro plan upgrade if applicable
            if (transaction.metadata?.upgradeType === 'pro-plan') {
                await this.processProPlanUpgrade(transaction.userId, transaction);
            }

            await transaction.save();
            this.logger.log(`Transaction updated for completed checkout: ${(transaction._id as string).toString()}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to handle checkout session completed: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
        }
    }

    /**
     * Handle payment intent succeeded webhook
     */
    private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        try {
            this.logger.log(`Handling payment intent succeeded: ${paymentIntent.id}`);

            const transaction = await this.stripeTransactionModel.findOne({
                stripeTransactionId: paymentIntent.id,
            });

            if (!transaction) {
                this.logger.warn(`Transaction not found for payment intent: ${paymentIntent.id}`);
                return;
            }

            transaction.status = StripeTransactionStatus.SUCCEEDED;
            transaction.completedAt = new Date();

            if (paymentIntent.customer) {
                transaction.customerId = paymentIntent.customer as string;
            }

            // Expand the payment intent to get charges
            const expandedPaymentIntent = await this.stripeClientService.getPaymentIntent(paymentIntent.id);

            if (expandedPaymentIntent.latest_charge) {
                const chargeId = expandedPaymentIntent.latest_charge as string;
                transaction.chargeId = chargeId;

                // Get charge details for receipt URL
                try {
                    const charge = await this.stripeClientService.getClient().charges.retrieve(chargeId);
                    transaction.receiptUrl = charge.receipt_url || undefined;
                } catch {
                    this.logger.warn(`Failed to retrieve charge details: ${chargeId}`);
                }
            }

            // Process pro plan upgrade if applicable
            if (transaction.metadata?.upgradeType === 'pro-plan-embedded') {
                await this.processProPlanUpgrade(transaction.userId, transaction);
            }

            await transaction.save();
            this.logger.log(
                `Transaction updated for succeeded payment intent: ${(transaction._id as string).toString()}`,
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to handle payment intent succeeded: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
        }
    }

    /**
     * Handle payment intent failed webhook
     */
    private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        try {
            this.logger.log(`Handling payment intent failed: ${paymentIntent.id}`);

            const transaction = await this.stripeTransactionModel.findOne({
                stripeTransactionId: paymentIntent.id,
            });

            if (!transaction) {
                this.logger.warn(`Transaction not found for payment intent: ${paymentIntent.id}`);
                return;
            }

            transaction.status = StripeTransactionStatus.FAILED;
            transaction.lastError = paymentIntent.last_payment_error?.message || 'Payment failed';

            await transaction.save();
            this.logger.log(`Transaction updated for failed payment intent: ${(transaction._id as string).toString()}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to handle payment intent failed: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
        }
    }

    /**
     * Handle invoice payment succeeded webhook (for subscriptions)
     */
    private handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): void {
        try {
            this.logger.log(`Handling invoice payment succeeded: ${invoice.id}`);

            // Handle subscription renewals here if needed
            // For now, we'll just log the event
            this.logger.log(`Invoice payment succeeded for invoice: ${invoice.id}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to handle invoice payment succeeded: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
        }
    }

    /**
     * Process pro plan upgrade after successful payment
     */
    private async processProPlanUpgrade(userId: string, transaction: StripeTransactionDocument): Promise<void> {
        try {
            this.logger.log(`Processing pro plan upgrade for user ${userId}`);

            const planType = transaction.metadata?.planType as ProPlanType;
            if (!planType) {
                this.logger.warn('No plan type found in transaction metadata');
                return;
            }

            // Calculate expiration date
            const expirationDate = new Date();
            if (planType === ProPlanType.MONTHLY) {
                expirationDate.setMonth(expirationDate.getMonth() + 1);
            } else if (planType === ProPlanType.YEARLY) {
                expirationDate.setFullYear(expirationDate.getFullYear() + 1);
            }

            // Update family plan
            const updateFamilyDto: UpdateFamilyDto = {
                plan: FamilyPlan.PRO,
                planExpiresAt: expirationDate,
            };

            const familyId = transaction.familyId || (transaction.metadata?.familyId as string);
            if (familyId && typeof familyId === 'string') {
                await this.familiesService.update(familyId, updateFamilyDto);
                this.logger.log(`Family plan updated to PRO for family ${familyId}`);

                // Send plan purchase confirmation email
                try {
                    const user = await this.usersService.findOne(userId);
                    const planName = planType === ProPlanType.MONTHLY ? 'Pro Monthly' : 'Pro Yearly';
                    const amount = parseFloat(transaction.metadata?.amount as string) || 0;
                    const currency = (transaction.metadata?.currency as string) || 'USD';
                    const billingCycle = planType === ProPlanType.MONTHLY ? 'Mensal' : 'Anual';

                    const planDetails = {
                        planName,
                        amount,
                        currency: currency.toUpperCase(),
                        features: [
                            'Compras ilimitadas',
                            'Listas de compras avançadas',
                            'Análise de gastos',
                            'Suporte prioritário',
                        ],
                        billingCycle,
                    };

                    await this.emailService.sendPlanPurchaseConfirmation(user.email || '', planDetails);

                    this.logger.log(`Plan purchase confirmation email sent to ${user.email || 'unknown'}`);
                } catch (emailError) {
                    this.logger.error(
                        `Failed to send plan purchase confirmation email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`,
                    );
                }
            } else {
                this.logger.warn('No family ID found for pro plan upgrade');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to process pro plan upgrade: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
        }
    }

    /**
     * Get pro plan price ID based on plan type
     */
    private getProPlanPriceId(planType: ProPlanType): string {
        switch (planType) {
            case ProPlanType.MONTHLY:
                return this.configService.get<string>('STRIPE_PRO_MONTHLY_PRICE_ID') || 'price_pro_monthly';
            case ProPlanType.YEARLY:
                return this.configService.get<string>('STRIPE_PRO_YEARLY_PRICE_ID') || 'price_pro_yearly';
            default:
                throw new Error(`Invalid plan type: ${planType as string}`);
        }
    }

    /**
     * Calculate plan amount in cents
     */
    private calculatePlanAmount(planType: ProPlanType): number {
        switch (planType) {
            case ProPlanType.MONTHLY:
                return 999; // $9.99 in cents
            case ProPlanType.YEARLY:
                return 9999; // $99.99 in cents
            default:
                throw new Error(`Invalid plan type: ${planType as string}`);
        }
    }

    /**
     * Map Stripe status to internal status
     */
    private mapStripeStatus(stripeStatus: string): string {
        const statusMap: Record<string, string> = {
            // Checkout Session statuses
            open: StripeTransactionStatus.PENDING,
            complete: StripeTransactionStatus.SUCCEEDED,
            expired: StripeTransactionStatus.EXPIRED,

            // Payment Intent statuses
            requires_payment_method: StripeTransactionStatus.PENDING,
            requires_confirmation: StripeTransactionStatus.PENDING,
            requires_action: StripeTransactionStatus.PENDING,
            processing: StripeTransactionStatus.PROCESSING,
            requires_capture: StripeTransactionStatus.PROCESSING,
            canceled: StripeTransactionStatus.CANCELED,
            succeeded: StripeTransactionStatus.SUCCEEDED,
        };

        return statusMap[stripeStatus] || StripeTransactionStatus.PENDING;
    }
}
