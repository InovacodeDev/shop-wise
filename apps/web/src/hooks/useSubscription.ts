import { useCallback, useEffect, useState } from 'react';

import { apiService } from '../services/api';
import { FeatureCode, Plan, Subscription, UserFeatures } from '../types/api';

interface UseSubscriptionReturn {
    features: UserFeatures | null;
    subscription: Subscription | null;
    plans: Plan[] | null;
    loading: boolean;
    error: string | null;
    hasFeature: (feature: FeatureCode) => boolean;
    upgradePlan: (planId: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
    const [features, setFeatures] = useState<UserFeatures | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [plans, setPlans] = useState<Plan[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [featuresData, subscriptionData, plansData] = await Promise.all([
                apiService.getUserFeatures(),
                apiService.getCurrentSubscription().catch(() => null), // Subscription might not exist
                apiService.getPlans(),
            ]);

            setFeatures(featuresData);
            setSubscription(subscriptionData);
            setPlans(plansData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load subscription data');
        } finally {
            setLoading(false);
        }
    }, []);

    const hasFeature = useCallback(
        (feature: FeatureCode): boolean => {
            return features?.features[feature] || false;
        },
        [features],
    );

    const upgradePlan = useCallback(
        async (planId: string) => {
            try {
                setLoading(true);
                const updatedSubscription = await apiService.upgradeSubscription(planId);
                setSubscription(updatedSubscription);
                await fetchData(); // Refresh all data
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to upgrade plan');
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [fetchData],
    );

    const refresh = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        features,
        subscription,
        plans,
        loading,
        error,
        hasFeature,
        upgradePlan,
        refresh,
    };
}

export function useFeatureAccess(feature: FeatureCode): boolean {
    const { hasFeature } = useSubscription();
    return hasFeature(feature);
}

export function usePremiumFeature(feature: FeatureCode) {
    const hasAccess = useFeatureAccess(feature);
    const { upgradePlan, plans, subscription } = useSubscription();

    return {
        hasAccess,
        upgradePlan,
        plans: plans?.filter((plan) => plan.price > 0) || [], // Only premium plans
        currentPlan: subscription,
        canUpgrade: !hasAccess,
    };
}
