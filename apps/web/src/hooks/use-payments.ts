import { apiService } from '@/services/api';
import type {
    CheckoutResponse,
    CreateCheckoutRequest,
    PaymentListParams,
    PaymentStatusResponse,
    PollStatusResponse,
    UserPaymentListResponse,
} from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Hook for creating checkout sessions
 */
export const useCreateCheckout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateCheckoutRequest) => apiService.createCheckout(request),
        onSuccess: () => {
            // Invalidate user payments list when a new checkout is created
            queryClient.invalidateQueries({ queryKey: ['user-payments'] });
        },
    });
};

/**
 * Hook for getting payment status with automatic polling
 */
export const usePaymentStatus = (
    transactionId: string,
    options?: {
        pollingEnabled?: boolean;
        pollingInterval?: number;
    },
) => {
    const pollingEnabled = options?.pollingEnabled ?? true;
    const pollingInterval = options?.pollingInterval ?? 10000; // 10 seconds

    return useQuery({
        queryKey: ['payment-status', transactionId],
        queryFn: () => apiService.getPaymentStatus(transactionId),
        enabled: !!transactionId,
        refetchInterval: pollingEnabled ? pollingInterval : false,
        refetchIntervalInBackground: true,
        staleTime: 5000, // Consider data stale after 5 seconds
    });
};

/**
 * Hook for listing user payments with pagination
 */
export const useUserPayments = (params?: PaymentListParams) => {
    return useQuery({
        queryKey: ['user-payments', params],
        queryFn: () => apiService.listUserPayments(params),
        staleTime: 30000, // Consider data stale after 30 seconds
    });
};

/**
 * Hook for forcing a transaction poll (for testing/debugging)
 */
export const useForcePollTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (transactionId: string) => apiService.forcePollTransaction(transactionId),
        onSuccess: (_, transactionId) => {
            // Invalidate the specific payment status query
            queryClient.invalidateQueries({ queryKey: ['payment-status', transactionId] });
        },
    });
};

/**
 * Hook for getting polling service status
 */
export const usePollingStatus = () => {
    return useQuery({
        queryKey: ['polling-status'],
        queryFn: () => apiService.getPollingStatus(),
        staleTime: 60000, // Consider data stale after 1 minute
    });
};

/**
 * Comprehensive hook for payment management with polling logic
 */
export const usePaymentManager = (transactionId?: string) => {
    const [isPolling, setIsPolling] = useState(true);
    const [pollInterval, setPollInterval] = useState(10000);

    const paymentStatusQuery = usePaymentStatus(transactionId || '', {
        pollingEnabled: isPolling && !!transactionId,
        pollingInterval: pollInterval,
    });

    const createCheckoutMutation = useCreateCheckout();
    const forcePollMutation = useForcePollTransaction();

    // Stop polling when payment reaches final state
    const stopPollingOnFinalState = () => {
        const status = paymentStatusQuery.data?.status;
        if (status && ['completed', 'failed', 'expired', 'cancelled'].includes(status.toLowerCase())) {
            setIsPolling(false);
        }
    };

    // Auto-stop polling when payment is in final state
    if (paymentStatusQuery.data) {
        stopPollingOnFinalState();
    }

    return {
        // Payment status
        paymentStatus: paymentStatusQuery.data,
        isLoadingStatus: paymentStatusQuery.isLoading,
        statusError: paymentStatusQuery.error,

        // Checkout creation
        createCheckout: createCheckoutMutation.mutate,
        isCreatingCheckout: createCheckoutMutation.isPending,
        checkoutError: createCheckoutMutation.error,
        checkoutData: createCheckoutMutation.data,

        // Force polling
        forcePoll: forcePollMutation.mutate,
        isForcingPoll: forcePollMutation.isPending,
        forcePollError: forcePollMutation.error,

        // Polling control
        isPolling,
        setIsPolling,
        pollInterval,
        setPollInterval,
        stopPolling: () => setIsPolling(false),
        startPolling: () => setIsPolling(true),

        // Utility functions
        isPaymentPending: () => {
            const status = paymentStatusQuery.data?.status?.toLowerCase();
            return status === 'open' || status === 'pending';
        },
        isPaymentCompleted: () => {
            return paymentStatusQuery.data?.status?.toLowerCase() === 'completed';
        },
        isPaymentFailed: () => {
            const status = paymentStatusQuery.data?.status?.toLowerCase();
            return ['failed', 'expired', 'cancelled'].includes(status || '');
        },
    };
};
