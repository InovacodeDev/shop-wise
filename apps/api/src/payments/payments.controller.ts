import {
    Body,
    Controller,
    Get,
    Headers,
    Logger,
    Param,
    Post,
    Query,
    Request,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateEmbeddedProPlanCheckoutDto } from './dto/create-embedded-pro-plan-checkout.dto';
import { CreateProPlanCheckoutDto } from './dto/create-pro-plan-checkout.dto';
import { GetPaymentStatusDto, ListUserPaymentsDto } from './dto/payment-query.dto';
import { CheckoutResponseDto, PaymentStatusResponseDto, UserPaymentListResponseDto } from './dto/payment-response.dto';
import { PaymentPollingService } from './services/payment-polling.service';
import { PaymentsService } from './services/payments.service';
import { StripeClientService } from './services/stripe-client.service';

@Controller('payments')
@UsePipes(new ValidationPipe({ transform: true }))
export class PaymentsController {
    private readonly logger = new Logger(PaymentsController.name);

    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly pollingService: PaymentPollingService,
        private readonly stripeClientService: StripeClientService,
    ) {}

    /**
     * Create a new checkout session
     */
    @Post('checkout')
    // @UseGuards(JwtAuthGuard) // Add authentication guard
    async createCheckout(
        @Body() createCheckoutDto: CreateCheckoutDto,
        @Request() req: AuthenticatedRequest,
    ): Promise<CheckoutResponseDto> {
        try {
            // Extract user ID from authenticated request
            const userId = req.user?.uid || 'demo-user'; // Temporary fallback for testing

            this.logger.log(`Creating checkout for user ${userId}`, createCheckoutDto);

            const checkout = await this.paymentsService.createCheckout(userId, createCheckoutDto);

            this.logger.log(`Checkout created successfully: ${checkout.id}`);
            return checkout;
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
     * Create a pro plan upgrade checkout session
     */
    @Post('pro-plan/checkout')
    @UseGuards()
    @UsePipes(new ValidationPipe())
    async createProPlanCheckout(
        @Request() req: AuthenticatedRequest,
        @Body() createProPlanDto: CreateProPlanCheckoutDto,
    ): Promise<CheckoutResponseDto> {
        try {
            // Extract user ID from authenticated request
            const userId = req.user?.uid || 'demo-user'; // Temporary fallback for testing

            this.logger.log(`Creating pro plan checkout for user ${userId}`, createProPlanDto);

            const checkout = await this.paymentsService.createProPlanCheckout(userId, createProPlanDto);

            this.logger.log(`Pro plan checkout created successfully: ${checkout.id}`);
            return checkout;
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
    @Post('pro-plan/embedded-checkout')
    @UseGuards()
    @UsePipes(new ValidationPipe())
    async createEmbeddedProPlanCheckout(
        @Request() req: AuthenticatedRequest,
        @Body() createEmbeddedDto: CreateEmbeddedProPlanCheckoutDto,
    ): Promise<{ transactionId: string; clientSecret: string; amount: number; currency: string }> {
        try {
            // Extract user ID from authenticated request
            const userId = req.user?.uid || 'demo-user'; // Temporary fallback for testing

            this.logger.log(`Creating embedded pro plan checkout for user ${userId}`, {
                planType: createEmbeddedDto.planType,
                customerEmail: createEmbeddedDto.customerEmail,
            });

            const result = await this.paymentsService.createEmbeddedProPlanCheckout(userId, createEmbeddedDto);

            this.logger.log(`Embedded pro plan checkout created successfully: ${result.transactionId}`);
            return result;
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
     * Confirm embedded payment with payment method
     */
    @Post('confirm-payment/:transactionId')
    @UseGuards()
    @UsePipes(new ValidationPipe())
    async confirmEmbeddedPayment(
        @Request() req: AuthenticatedRequest,
        @Param('transactionId') transactionId: string,
        @Body() confirmationData: { paymentMethodId: string },
    ): Promise<{ success: boolean; status: string }> {
        try {
            // Extract user ID from authenticated request
            const userId = req.user?.uid || 'demo-user';

            this.logger.log(`Confirming embedded payment ${transactionId} for user ${userId}`);

            // Get transaction and validate ownership
            const transaction = await this.paymentsService.getPaymentStatus(transactionId, userId);

            if (!transaction) {
                throw new Error('Transaction not found');
            }

            // Confirm payment with Stripe
            const result = await this.paymentsService.confirmEmbeddedPayment(
                transactionId,
                userId,
                confirmationData.paymentMethodId,
            );

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to confirm embedded payment: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw error;
        }
    }

    /**
     * Get payment status by transaction ID
     */
    @Get(':transactionId/status')
    // @UseGuards(JwtAuthGuard) // Add authentication guard
    async getPaymentStatus(
        @Param() params: GetPaymentStatusDto,
        @Request() req: AuthenticatedRequest,
    ): Promise<PaymentStatusResponseDto> {
        try {
            // Extract user ID from authenticated request
            const userId = req.user?.uid || 'demo-user'; // Temporary fallback for testing

            this.logger.log(`Getting payment status for transaction ${params.transactionId} by user ${userId}`);

            const paymentStatus = await this.paymentsService.getPaymentStatus(params.transactionId, userId);

            return paymentStatus;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to get payment status for transaction ${params.transactionId}: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw error;
        }
    }

    /**
     * List user payments with pagination
     */
    @Get('user/payments')
    // @UseGuards(JwtAuthGuard) // Add authentication guard
    async listUserPayments(
        @Query() query: ListUserPaymentsDto,
        @Request() req: AuthenticatedRequest,
    ): Promise<UserPaymentListResponseDto> {
        try {
            // Extract user ID from authenticated request
            const userId = req.user?.uid || 'demo-user'; // Temporary fallback for testing

            const limit = query.limit ? parseInt(query.limit, 10) : 10;
            const page = query.page ? parseInt(query.page, 10) : 1;
            const offset = (page - 1) * limit;

            this.logger.log(`Listing payments for user ${userId}`, { limit, offset, status: query.status });

            const payments = await this.paymentsService.getUserPayments(userId, limit, offset);

            return payments;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to list payments for user: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw error;
        }
    }

    /**
     * Force poll a specific transaction (for testing/debugging)
     */
    @Post(':transactionId/force-poll')
    // @UseGuards(JwtAuthGuard) // Add authentication guard
    async forcePollTransaction(
        @Param() params: GetPaymentStatusDto,
        @Request() req: AuthenticatedRequest,
    ): Promise<{ message: string }> {
        try {
            // Extract user ID from authenticated request (for authorization)
            const userId = req.user?.uid || 'demo-user'; // Temporary fallback for testing

            this.logger.log(`Force polling transaction ${params.transactionId} by user ${userId}`);

            // Verify user owns the transaction
            await this.paymentsService.getPaymentStatus(params.transactionId, userId);

            // Force poll the transaction
            await this.pollingService.forcePoll(params.transactionId);

            return { message: 'Transaction polled successfully' };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Failed to force poll transaction ${params.transactionId}: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw error;
        }
    }

    /**
     * Stripe webhook endpoint
     */
    @Post('stripe/webhook')
    async handleStripeWebhook(
        @Request() req: Request & { rawBody?: Buffer; body?: string },
        @Headers('stripe-signature') signature: string,
    ): Promise<{ received: boolean }> {
        try {
            const rawBody: string | Buffer = req.rawBody || req.body || '';

            this.logger.log('Received Stripe webhook');

            // Validate webhook signature and construct event
            // Note: webhook secret should be configured in environment variables
            const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
            if (!webhookSecret) {
                throw new Error('Stripe webhook secret not configured');
            }

            const event = this.stripeClientService.validateWebhookSignature(rawBody, signature, webhookSecret);

            // Process the validated event
            await this.paymentsService.processWebhookEvent(event);

            return { received: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
                `Webhook processing failed: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw error;
        }
    }

    /**
     * Get polling service status (for debugging)
     */
    @Get('polling/status')
    getPollingStatus(): {
        isPolling: boolean;
        pollIntervalMs: number;
        maxRetries: number;
        pollingTimeoutMs: number;
    } {
        return this.pollingService.getStatus();
    }
}
