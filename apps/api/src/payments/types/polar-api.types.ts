/**
 * Types for Polar API responses and requests
 * These types help eliminate 'any' usage and provide better type safety
 */

export interface PolarCheckoutSession {
    id: string;
    totalAmount?: number;
    currency?: string;
    status?: string;
    productPriceId?: string;
    discountId?: string;
    customerId?: string;
    customerEmail?: string;
    url?: string;
    expiresAt?: string | Date;
    productId?: string;
    clientSecret?: string;
    [key: string]: unknown;
}

export interface PolarPaymentIntent {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
    status: string;
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
}

export interface PolarCustomer {
    id: string;
    email?: string;
    name?: string;
    [key: string]: unknown;
}

export interface PolarProduct {
    id: string;
    name: string;
    description?: string;
    prices?: PolarPrice[];
    [key: string]: unknown;
}

export interface PolarPrice {
    id: string;
    amount: number;
    currency: string;
    recurring?: {
        interval: string;
        intervalCount: number;
    };
    [key: string]: unknown;
}

export interface PolarSubscription {
    id: string;
    customerId: string;
    productId: string;
    priceId: string;
    status: string;
    currentPeriodStart: string | Date;
    currentPeriodEnd: string | Date;
    [key: string]: unknown;
}

export interface PolarWebhookPayload {
    type: string;
    data: {
        id: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

// Request types for Polar client
export interface CheckoutCreateRequest {
    products: string[];
    customerId?: string;
    customerEmail?: string;
    successUrl?: string;
    metadata?: Record<string, unknown>;
    customerBillingAddress?: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
}
