import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/md3/button";
import { useLingui, Plural } from '@lingui/react/macro';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendar,
    faStore,
    faShoppingCart,
    faDollarSign,
    faExclamationTriangle,
    faRefresh,
    faChevronDown,
    faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { getPurchasesByMonth } from "@/services/purchaseApiService";
import type { MonthlyPurchaseGroup, Purchase } from "@/types/api";
import { getCurrencyFromLocale } from "@/lib/localeCurrency";
import { materialSpacing } from "@/lib/material-design";

interface MonthlyPurchaseDisplayProps {
    /** Optional family ID override - if not provided, uses current user's family */
    familyId?: string;
    /** Optional callback when a purchase is selected */
    onPurchaseSelect?: (purchase: Purchase) => void;
    /** Optional callback when data is loaded */
    onDataLoaded?: (groups: MonthlyPurchaseGroup[]) => void;
    /** Optional callback when an error occurs */
    onError?: (error: Error) => void;
}

export function MonthlyPurchaseDisplay({
    familyId: propFamilyId,
    onPurchaseSelect,
    onDataLoaded,
    onError,
}: MonthlyPurchaseDisplayProps) {
    const { i18n, t } = useLingui();
    const { profile } = useAuth();
    const [monthlyGroups, setMonthlyGroups] = useState<MonthlyPurchaseGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);
    const [fallbackMode, setFallbackMode] = useState(false);

    // Use prop familyId or fall back to user's family
    const familyId = propFamilyId || profile?.familyId;

    // Get current month key for default expansion
    const currentMonthKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    const fetchMonthlyPurchases = async (showLoadingState = true, isRetryAttempt = false) => {
        if (!familyId) {
            setError(t`Family ID is required to load purchases.`);
            setLoading(false);
            return;
        }

        if (showLoadingState) {
            setLoading(true);
        }
        if (isRetryAttempt) {
            setIsRetrying(true);
        }
        setError(null);

        try {
            const groups = await getPurchasesByMonth(familyId);
            setMonthlyGroups(groups);
            setRetryCount(0);
            setFallbackMode(false);

            // Call callback if provided
            if (onDataLoaded) {
                onDataLoaded(groups);
            }
        } catch (err) {
            const error = err as any;
            let errorMessage = error.message || t`Failed to load purchase history.`;

            // Handle specific error cases
            if (error.status === 401 || error.status === 403) {
                errorMessage = t`Please log in again to access your purchase history.`;
            } else if (error.status === 404) {
                errorMessage = t`Family not found. Please check your account settings.`;
            } else if (error.message?.includes('Network connection failed')) {
                errorMessage = t`No internet connection. Please check your network and try again.`;
            }

            setError(errorMessage);

            // Attempt fallback to flat list if monthly grouping fails and it's not a network/auth error
            if (!fallbackMode && error.status !== 401 && error.status !== 403 && !error.message?.includes('Network connection failed')) {
                try {
                    console.warn('Monthly grouping failed, attempting fallback to flat list');
                    const { getPurchases } = await import('@/services/purchaseApiService');
                    const flatPurchases = await getPurchases(familyId);

                    // Convert flat purchases to a single monthly group for current month
                    if (flatPurchases.length > 0) {
                        const fallbackGroup: MonthlyPurchaseGroup = {
                            monthYear: 'fallback',
                            displayName: t`All Purchases (Fallback Mode)`,
                            totalAmount: flatPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
                            purchaseCount: flatPurchases.length,
                            purchases: flatPurchases.sort((a, b) =>
                                new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
                            ),
                        };

                        setMonthlyGroups([fallbackGroup]);
                        setFallbackMode(true);
                        setError(null);

                        toast({
                            title: t`Fallback Mode Active`,
                            description: t`Monthly grouping is temporarily unavailable. Showing all purchases in a single list.`,
                            variant: "default",
                        });

                        if (onDataLoaded) {
                            onDataLoaded([fallbackGroup]);
                        }
                        return;
                    }
                } catch (fallbackError) {
                    console.error('Fallback to flat list also failed:', fallbackError);
                    // Keep the original error message
                }
            }

            // Call error callback if provided
            if (onError && err instanceof Error) {
                onError(err);
            }

            console.error('Error fetching monthly purchases:', err);
        } finally {
            setLoading(false);
            setIsRetrying(false);
        }
    };

    useEffect(() => {
        fetchMonthlyPurchases();
    }, [familyId]);

    const handleRetry = async () => {
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);

        // Implement exponential backoff for retries
        if (newRetryCount > 1) {
            const delay = Math.min(1000 * Math.pow(2, newRetryCount - 2), 10000); // Max 10 seconds
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        fetchMonthlyPurchases(true, true);
    };

    const handlePurchaseClick = (purchase: Purchase) => {
        if (onPurchaseSelect) {
            onPurchaseSelect(purchase);
        }
    };

    // Calculate total statistics
    const totalStats = useMemo(() => {
        return monthlyGroups.reduce(
            (acc, group) => ({
                totalAmount: acc.totalAmount + group.totalAmount,
                totalPurchases: acc.totalPurchases + group.purchaseCount,
            }),
            { totalAmount: 0, totalPurchases: 0 }
        );
    }, [monthlyGroups]);

    if (loading) {
        return <MonthlyPurchaseDisplaySkeleton />;
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <Alert variant="destructive">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4" />
                        <AlertDescription className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span>{error}</span>
                                <Button
                                    variant="outlined"
                                    size="sm"
                                    onClick={handleRetry}
                                    disabled={isRetrying}
                                    className="ml-4"
                                >
                                    <FontAwesomeIcon
                                        icon={faRefresh}
                                        className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`}
                                    />
                                    {isRetrying ? t`Retrying...` : t`Retry`}
                                </Button>
                            </div>
                            {retryCount > 0 && (
                                <div className="text-sm text-muted-foreground">
                                    {t`Retry attempt: ${retryCount}`}
                                </div>
                            )}
                            {fallbackMode && (
                                <div className="text-sm text-blue-600">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="h-3 w-3 mr-1" />
                                    {t`Running in fallback mode - some features may be limited`}
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (monthlyGroups.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <EmptyState
                        icon={faShoppingCart}
                        title={t`No Purchases Found`}
                        description={t`Start adding purchases to see your monthly spending history here.`}
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <div
            className="flex flex-col"
            style={{ gap: materialSpacing['2xl'] }}
        >
            {/* Fallback Mode Warning */}
            {fallbackMode && (
                <Card>
                    <CardContent className="pt-6">
                        <Alert>
                            <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4" />
                            <AlertDescription>
                                {t`Monthly grouping is temporarily unavailable. Showing all purchases in a single list.`}
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}

            {/* Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-primary" />
                        {t`Purchase History Summary`}
                    </CardTitle>
                    <CardDescription>
                        <div className="flex flex-col sm:flex-row gap-4 mt-2">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faShoppingCart} className="w-4 h-4 text-muted-foreground" />
                                <Plural
                                    value={totalStats.totalPurchases}
                                    one="# purchase"
                                    other="# purchases"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faDollarSign} className="w-4 h-4 text-muted-foreground" />
                                <span>
                                    {t`Total: ${i18n.number(
                                        totalStats.totalAmount,
                                        {
                                            style: 'currency',
                                            currencySign: 'accounting',
                                            currency: getCurrencyFromLocale(i18n.locale),
                                        }
                                    )}`}
                                </span>
                            </div>
                        </div>
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Monthly Groups */}
            <Card>
                <CardContent className="pt-6">
                    <Accordion
                        type="multiple"
                        defaultValue={[currentMonthKey]}
                        className="w-full"
                    >
                        {monthlyGroups.map((group) => (
                            <AccordionItem key={group.monthYear} value={group.monthYear}>
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-3">
                                            <FontAwesomeIcon
                                                icon={faCalendar}
                                                className="w-5 h-5 text-primary"
                                            />
                                            <div className="text-left">
                                                <div className="font-semibold text-lg">
                                                    {group.displayName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    <Plural
                                                        value={group.purchaseCount}
                                                        one="# purchase"
                                                        other="# purchases"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 font-bold text-lg">
                                            <span>
                                                {i18n.number(
                                                    group.totalAmount,
                                                    {
                                                        style: 'currency',
                                                        currencySign: 'accounting',
                                                        currency: getCurrencyFromLocale(i18n.locale),
                                                    }
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div
                                        className="pt-2"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: materialSpacing.lg
                                        }}
                                    >
                                        {group.purchases.map((purchase) => (
                                            <PurchaseCard
                                                key={purchase._id}
                                                purchase={purchase}
                                                onClick={() => handlePurchaseClick(purchase)}
                                            />
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}

interface PurchaseCardProps {
    purchase: Purchase;
    onClick?: () => void;
}

const PurchaseCard = memo(function PurchaseCard({ purchase, onClick }: PurchaseCardProps) {
    const { i18n, t } = useLingui();

    const purchaseDate = useMemo(() => new Date(purchase.date), [purchase.date]);
    const itemCount = useMemo(() => purchase.items?.length || 0, [purchase.items?.length]);

    const formattedDate = useMemo(() =>
        purchaseDate.toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }), [purchaseDate]
    );

    return (
        <Card
            className={`transition-all duration-200 ${onClick ? 'hover:shadow-md cursor-pointer hover:bg-accent/50' : ''
                }`}
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FontAwesomeIcon
                            icon={faStore}
                            className="w-4 h-4 text-primary"
                        />
                        <div>
                            <div className="font-medium truncate max-w-[200px]">
                                {purchase.storeName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {formattedDate}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {itemCount > 0 && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <FontAwesomeIcon icon={faShoppingCart} className="w-3 h-3" />
                                <Plural value={itemCount} one="# item" other="# items" />
                            </div>
                        )}
                        <div className="flex items-center gap-1 font-semibold">
                            <span>
                                {i18n.number(
                                    purchase.totalAmount,
                                    {
                                        style: 'currency',
                                        currencySign: 'accounting',
                                        currency: getCurrencyFromLocale(i18n.locale),
                                    }
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

function MonthlyPurchaseDisplaySkeleton() {
    const { t } = useLingui();

    return (
        <div
            className="flex flex-col"
            style={{ gap: materialSpacing['2xl'] }}
        >
            {/* Summary Card Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-64" />
                    <div className="flex gap-4 mt-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </CardHeader>
            </Card>

            {/* Monthly Groups Skeleton */}
            <Card>
                <CardContent className="pt-6">
                    <div
                        className="flex flex-col"
                        style={{ gap: materialSpacing.lg }}
                    >
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="border-b pb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-5 w-5" />
                                        <div>
                                            <Skeleton className="h-6 w-32" />
                                            <Skeleton className="h-4 w-24 mt-1" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-20" />
                                </div>
                                <div
                                    className="ml-8"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: materialSpacing.sm
                                    }}
                                >
                                    {[...Array(2)].map((_, j) => (
                                        <Card key={j}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-4 w-4" />
                                                        <div>
                                                            <Skeleton className="h-4 w-32" />
                                                            <Skeleton className="h-3 w-24 mt-1" />
                                                        </div>
                                                    </div>
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default MonthlyPurchaseDisplay;