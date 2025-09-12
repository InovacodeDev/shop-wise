import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreateCheckoutParams {
    priceIds: string[];
    customerId?: string;
    customerEmail?: string;
    successUrl?: string;
    cancelUrl?: string;
    metadata?: Record<string, any>;
    customerBillingAddress?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country: string;
    };
    mode?: 'payment' | 'subscription' | 'setup';
}

export interface CreatePaymentIntentParams {
    amount: number;
    currency: string;
    customerEmail: string;
    customerName: string;
    billingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    metadata?: Record<string, any>;
    paymentMethodTypes?: string[];
}

export interface CreateCustomerParams {
    email: string;
    name?: string;
    address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    metadata?: Record<string, any>;
}

@Injectable()
export class StripeClientService {
    private readonly logger = new Logger(StripeClientService.name);
    private readonly stripe: Stripe;

    constructor(private readonly configService: ConfigService) {
        const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

        if (!secretKey) {
            throw new InternalServerErrorException('STRIPE_SECRET_KEY is required but not provided');
        }

        this.stripe = new Stripe(secretKey, {
            apiVersion: '2025-08-27.basil',
            appInfo: {
                name: 'Shop Wise API',
                version: '1.0.0',
            },
        });

        this.logger.log(`Stripe client initialized successfully (${isProduction ? 'production' : 'test'} environment)`);
    }

    /**
     * Get the Stripe client instance
     */
    getClient(): Stripe {
        return this.stripe;
    }

    /**
     * Create a checkout session
     */
    async createCheckoutSession(params: CreateCheckoutParams): Promise<Stripe.Checkout.Session> {
        try {
            this.logger.log(`Creating checkout session with params:`, {
                priceIds: params.priceIds,
                customerId: params.customerId,
                successUrl: params.successUrl,
                mode: params.mode || 'payment',
            });

            const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.priceIds.map((priceId) => ({
                price: priceId,
                quantity: 1,
            }));

            const sessionParams: Stripe.Checkout.SessionCreateParams = {
                line_items: lineItems,
                mode: params.mode || 'payment',
                success_url:
                    params.successUrl ||
                    `${this.configService.get('CLIENT_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: params.cancelUrl || `${this.configService.get('CLIENT_URL')}/payment/cancel`,
                metadata: params.metadata || {},
            };

            if (params.customerId) {
                sessionParams.customer = params.customerId;
            } else if (params.customerEmail) {
                sessionParams.customer_email = params.customerEmail;
            }

            if (params.customerBillingAddress) {
                sessionParams.billing_address_collection = 'required';
            }

            const session = await this.stripe.checkout.sessions.create(sessionParams);

            this.logger.log(`Checkout session created successfully: ${session.id}`);
            return session;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to create checkout session: ${errorMessage}`, errorStack);
            throw new InternalServerErrorException('Failed to create checkout session');
        }
    }

    /**
     * Create a payment intent for embedded checkout
     */
    async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
        try {
            this.logger.log(`Creating payment intent for embedded checkout:`, {
                amount: params.amount,
                currency: params.currency,
                customerEmail: params.customerEmail,
            });

            const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
                amount: params.amount,
                currency: params.currency,
                payment_method_types: params.paymentMethodTypes || ['card'],
                metadata: params.metadata || {},
            };

            // Create or retrieve customer
            const customers = await this.stripe.customers.list({
                email: params.customerEmail,
                limit: 1,
            });

            let customer: Stripe.Customer;
            if (customers.data.length > 0) {
                customer = customers.data[0];
            } else {
                customer = await this.stripe.customers.create({
                    email: params.customerEmail,
                    name: params.customerName,
                    address: {
                        line1: params.billingAddress.line1,
                        line2: params.billingAddress.line2,
                        city: params.billingAddress.city,
                        state: params.billingAddress.state,
                        postal_code: params.billingAddress.postalCode,
                        country: params.billingAddress.country,
                    },
                });
            }

            paymentIntentParams.customer = customer.id;

            const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentParams);

            this.logger.log(`Payment intent created successfully: ${paymentIntent.id}`);
            return paymentIntent;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to create payment intent: ${errorMessage}`, errorStack);
            throw new InternalServerErrorException('Failed to create payment intent');
        }
    }

    /**
     * Confirm payment intent with payment method
     */
    async confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string): Promise<Stripe.PaymentIntent> {
        try {
            this.logger.log(`Confirming payment intent: ${paymentIntentId} with payment method: ${paymentMethodId}`);

            const confirmParams: Stripe.PaymentIntentConfirmParams = {};

            if (paymentMethodId) {
                confirmParams.payment_method = paymentMethodId;
            }

            const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, confirmParams);

            this.logger.log(`Payment intent confirmed successfully: ${paymentIntentId}`);
            return paymentIntent;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to confirm payment intent: ${errorMessage}`, errorStack);
            throw new InternalServerErrorException('Failed to confirm payment intent');
        }
    }

    /**
     * Get checkout session by ID
     */
    async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
        try {
            this.logger.log(`Retrieving checkout session: ${sessionId}`);

            const session = await this.stripe.checkout.sessions.retrieve(sessionId);

            return session;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to retrieve checkout session ${sessionId}: ${errorMessage}`, errorStack);
            throw new InternalServerErrorException('Failed to retrieve checkout session');
        }
    }

    /**
     * Get payment intent by ID
     */
    async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
        try {
            this.logger.log(`Retrieving payment intent: ${paymentIntentId}`);

            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

            return paymentIntent;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to retrieve payment intent ${paymentIntentId}: ${errorMessage}`, errorStack);
            throw new InternalServerErrorException('Failed to retrieve payment intent');
        }
    }

    /**
     * Create a customer
     */
    async createCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
        try {
            this.logger.log(`Creating customer with email: ${params.email}`);

            const customerParams: Stripe.CustomerCreateParams = {
                email: params.email,
                name: params.name,
                metadata: params.metadata || {},
            };

            if (params.address) {
                customerParams.address = {
                    line1: params.address.line1,
                    line2: params.address.line2,
                    city: params.address.city,
                    state: params.address.state,
                    postal_code: params.address.postalCode,
                    country: params.address.country,
                };
            }

            const customer = await this.stripe.customers.create(customerParams);

            this.logger.log(`Customer created successfully: ${customer.id}`);
            return customer;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to create customer: ${errorMessage}`, errorStack);
            throw new InternalServerErrorException('Failed to create customer');
        }
    }

    /**
     * Get customer by ID
     */
    async getCustomer(customerId: string): Promise<Stripe.Customer> {
        try {
            this.logger.log(`Retrieving customer: ${customerId}`);

            const customer = await this.stripe.customers.retrieve(customerId);

            if (customer.deleted) {
                throw new InternalServerErrorException('Customer has been deleted');
            }

            return customer as Stripe.Customer;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to retrieve customer ${customerId}: ${errorMessage}`, errorStack);
            throw new InternalServerErrorException('Failed to retrieve customer');
        }
    }

    /**
     * Get product by ID
     */
    async getProduct(productId: string): Promise<Stripe.Product> {
        try {
            this.logger.log(`Retrieving product: ${productId}`);

            const product = await this.stripe.products.retrieve(productId);

            return product;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to retrieve product ${productId}: ${errorMessage}`, errorStack);
            throw new InternalServerErrorException('Failed to retrieve product');
        }
    }

    /**
     * Get price by ID
     */
    async getPrice(priceId: string): Promise<Stripe.Price> {
        try {
            this.logger.log(`Retrieving price: ${priceId}`);

            const price = await this.stripe.prices.retrieve(priceId);

            return price;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to retrieve price ${priceId}: ${errorMessage}`, errorStack);
            throw new InternalServerErrorException('Failed to retrieve price');
        }
    }

    /**
     * List products
     */
    async listProducts(params?: {
        limit?: number;
        starting_after?: string;
        active?: boolean;
    }): Promise<Stripe.ApiList<Stripe.Product>> {
        try {
            this.logger.log('Listing products with filters:', params);

            const products = await this.stripe.products.list(params || {});

            return products;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to list products: ${errorMessage}`, errorStack);
            throw new InternalServerErrorException('Failed to list products');
        }
    }

    /**
     * List prices
     */
    async listPrices(params?: {
        product?: string;
        limit?: number;
        starting_after?: string;
        active?: boolean;
    }): Promise<Stripe.ApiList<Stripe.Price>> {
        try {
            this.logger.log('Listing prices with filters:', params);

            const prices = await this.stripe.prices.list(params || {});

            return prices;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to list prices: ${errorMessage}`, errorStack);
            throw new InternalServerErrorException('Failed to list prices');
        }
    }

    /**
     * Validate webhook signature
     */
    validateWebhookSignature(payload: string | Buffer, signature: string, endpointSecret: string): Stripe.Event {
        try {
            this.logger.log(`Validating webhook signature for payload length: ${payload.length}`);

            const event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);

            this.logger.log(`Webhook signature validated successfully for event: ${event.type}`);
            return event;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Webhook signature validation failed: ${errorMessage}`);
            throw new InternalServerErrorException('Webhook signature validation failed');
        }
    }
}
