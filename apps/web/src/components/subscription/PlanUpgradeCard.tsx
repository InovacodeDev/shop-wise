import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Plan, FeatureCode } from '../../types/api';
import { useSubscription } from '../../hooks/useSubscription';

interface PlanUpgradeCardProps {
    plan: Plan;
    onUpgrade?: (planId: string) => void;
    compact?: boolean;
}

const FEATURE_LABELS: Record<FeatureCode, string> = {
    basic_finances: 'Controle Básico de Finanças',
    advanced_finances: 'Orçamentos e Metas Avançadas',
    investments: 'Portfólio de Investimentos',
    gamification: 'Sistema de Conquistas',
    education: 'Conteúdo Educacional',
    offline_sync: 'Sincronização Offline',
    bank_integration: 'Integração Bancária',
    advanced_reports: 'Relatórios Avançados',
    unlimited_storage: 'Armazenamento Ilimitado',
    priority_support: 'Suporte Prioritário',
};

const PlanUpgradeCard: React.FC<PlanUpgradeCardProps> = ({
    plan,
    onUpgrade,
    compact = false,
}) => {
    const { subscription, upgradePlan } = useSubscription();
    const [upgrading, setUpgrading] = useState(false);

    const isCurrentPlan = subscription?.planId === plan._id;
    const isFreePlan = plan.price === 0;
    const hasTrial = plan.trialDays && plan.trialDays > 0;

    const handleUpgrade = async () => {
        if (isCurrentPlan) return;

        const confirmed = window.confirm(
            `Deseja fazer upgrade para o plano ${plan.name} por R$ ${plan.price.toFixed(2)}/${plan.interval === 'monthly' ? 'mês' : 'ano'}?${hasTrial ? ` Você terá ${plan.trialDays} dias de teste gratuito.` : ''}`
        );

        if (!confirmed) return;

        try {
            setUpgrading(true);
            await upgradePlan(plan._id);
            alert(`Upgrade para ${plan.name} realizado com sucesso!`);
            onUpgrade?.(plan._id);
        } catch (error) {
            alert('Não foi possível fazer o upgrade. Tente novamente.');
        } finally {
            setUpgrading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    };

    if (compact) {
        return (
            <div className={`border rounded-lg p-4 transition-all ${isCurrentPlan ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-semibold text-gray-800">{plan.name}</h3>
                        <p className="text-sm text-gray-600">
                            {isFreePlan ? 'Grátis' : `${formatCurrency(plan.price)}/${plan.interval === 'monthly' ? 'mês' : 'ano'}`}
                        </p>
                    </div>
                    {isCurrentPlan && (
                        <div className="flex items-center gap-1 text-green-600">
                            <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                            <span className="text-sm font-medium">Atual</span>
                        </div>
                    )}
                </div>

                {hasTrial && !isCurrentPlan && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-3">
                        <p className="text-xs text-blue-700">🎁 {plan.trialDays} dias grátis</p>
                    </div>
                )}

                <button
                    onClick={handleUpgrade}
                    disabled={isCurrentPlan || upgrading}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${isCurrentPlan
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : upgrading
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {isCurrentPlan ? 'Plano Atual' : upgrading ? 'Processando...' : 'Fazer Upgrade'}
                </button>
            </div>
        );
    }

    return (
        <div className={`border-2 rounded-xl p-6 transition-all ${isCurrentPlan ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isFreePlan ? 'bg-gray-100' : 'bg-amber-100'}`}>
                        <FontAwesomeIcon icon={faCrown} className={`h-6 w-6 ${isFreePlan ? 'text-gray-500' : 'text-amber-600'}`} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">
                        {isFreePlan ? 'Grátis' : formatCurrency(plan.price)}
                    </div>
                    {!isFreePlan && (
                        <div className="text-sm text-gray-500">
                            /{plan.interval === 'monthly' ? 'mês' : 'ano'}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2 mb-6">
                {plan.features.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                            {FEATURE_LABELS[feature.code as FeatureCode] || feature.name}
                        </span>
                    </div>
                ))}
                {plan.features.length > 5 && (
                    <div className="text-sm text-gray-500 italic">
                        +{plan.features.length - 5} recursos adicionais
                    </div>
                )}
            </div>

            {hasTrial && !isCurrentPlan && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                            {plan.trialDays} dias de teste gratuito
                        </span>
                    </div>
                </div>
            )}

            <button
                onClick={handleUpgrade}
                disabled={isCurrentPlan || upgrading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${isCurrentPlan
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : upgrading
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    }`}
            >
                {isCurrentPlan ? 'Plano Atual' : upgrading ? 'Processando...' : 'Fazer Upgrade'}
            </button>
        </div>
    );
};

export default PlanUpgradeCard;
