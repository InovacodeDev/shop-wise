import React from 'react';
import { t } from '@lingui/core/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faLock } from '@fortawesome/free-solid-svg-icons';
import { FeatureCode } from '../../types/api';
import { usePremiumFeature } from '../../hooks/useSubscription';

interface PremiumFeatureGuardProps {
    feature: FeatureCode;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showUpgrade?: boolean;
    onUpgradePress?: () => void;
}

const FEATURE_NAMES: Record<FeatureCode, string> = {
    basic_finances: 'Basic Finances',
    advanced_finances: 'Advanced Finances',
    investments: 'Investment Portfolio',
    gamification: 'Achievements System',
    education: 'Financial Education',
    offline_sync: 'Offline Sync',
    bank_integration: 'Bank Integration',
    advanced_reports: 'Advanced Reports',
    unlimited_storage: 'Unlimited Storage',
    priority_support: 'Priority Support',
};

const PremiumFeatureGuard: React.FC<PremiumFeatureGuardProps> = ({
    feature,
    children,
    fallback,
    showUpgrade = true,
    onUpgradePress,
}) => {
    const { hasAccess, canUpgrade, plans } = usePremiumFeature(feature);

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-[300px]">
            <div className="mb-4 p-4 bg-gray-100 rounded-full">
                <FontAwesomeIcon icon={faLock} className="h-12 w-12 text-gray-500" />
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t`Premium Feature`}
            </h3>

            <p className="text-gray-600 text-center mb-6 max-w-md">
                {t`${FEATURE_NAMES[feature]} is available to premium users only.`}
            </p>

            {showUpgrade && canUpgrade && (
                <div className="text-center">
                    <button
                        onClick={onUpgradePress}
                        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        <FontAwesomeIcon icon={faCrown} className="h-5 w-5" />
                        Upgrade
                    </button>

                    <p className="text-sm text-gray-500 mt-2">
                        {t`Plans starting at`} R$ {Math.min(...plans.map(p => p.price)).toFixed(2)}/{t`month`}
                    </p>
                </div>
            )}

            <p className="text-sm text-gray-400 text-center mt-4 max-w-sm">
                {t`Upgrade to access this and many other advanced features.`}
            </p>
        </div>
    );
};

export default PremiumFeatureGuard;
