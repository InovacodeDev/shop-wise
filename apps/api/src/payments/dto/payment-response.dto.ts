export class CheckoutResponseDto {
    id: string;
    url?: string;
    status: string;
    amount?: number;
    currency?: string;
    expiresAt?: string;
    createdAt: string;
    metadata?: Record<string, any>;
}

export class PaymentStatusResponseDto {
    transactionId: string;
    stripeTransactionId: string;
    status: string;
    amount: number;
    currency: string;
    type: string;
    customerId?: string;
    checkoutUrl?: string;
    createdAt: string;
    updatedAt?: string;
    completedAt?: string;
    metadata?: Record<string, any>;
}

export class UserPaymentListResponseDto {
    payments: PaymentStatusResponseDto[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}
