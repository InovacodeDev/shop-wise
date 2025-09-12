import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { Card, CardContent } from '@/components/md3/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faDollarSign, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useLingui, Plural } from '@lingui/react/macro';
import { MonthlyPurchaseGroup, Purchase } from '@/types/api';
import { VirtualPurchaseList } from './virtual-purchase-list';
import { useOptimizedAccordionState, useAccordionPerformanceMetrics } from '@/hooks/use-optimized-accordion-state';

interface OptimizedMonthlyAccordionProps {
    monthlyGroups: MonthlyPurchaseGroup[];
    defaultExpandedMonths?: string[];
    onPurchaseSelect?: (purchase: Purchase) => void;
    maxVisiblePurchases?: number;
    virtualScrollHeight?: number;
    maxExpandedMonths?: number;
    enablePerformanceMonitoring?: boolean;
    persistExpandedState?: boolean;
}

interface MonthlyGroupItemProps {
    group: MonthlyPurchaseGroup;
    isExpanded: boolean;
    onToggle: () => void;
    onPurchaseSelect?: (purchase: Purchase) => void;
    maxVisiblePurchases: number;
    virtualScrollHeight: number;
}

const MonthlyGroupItem = memo(function MonthlyGroupItem({
    group,
    isExpanded,
    onToggle,
    onPurchaseSelect,
    maxVisiblePurchases,
    virtualScrollHeight,
}: MonthlyGroupItemProps) {
    const { t } = useLingui();

    const shouldUseVirtualScrolling = useMemo(() =>
        group.purchases.length > maxVisiblePurchases,
        [group.purchases.length, maxVisiblePurchases]
    );

    const displayedPurchases = useMemo(() =>
        shouldUseVirtualScrolling ? group.purchases : group.purchases.slice(0, maxVisiblePurchases),
        [group.purchases, shouldUseVirtualScrolling, maxVisiblePurchases]
    );

    const hasMorePurchases = useMemo(() =>
        !shouldUseVirtualScrolling && group.purchases.length > maxVisiblePurchases,
        [shouldUseVirtualScrolling, group.purchases.length, maxVisiblePurchases]
    );

    return (
        <Card className="mb-4">
            <CardContent className="p-0">
                <button
                    onClick={onToggle}
                    className="w-full p-4 text-left hover:bg-accent/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    aria-expanded={isExpanded}
                    aria-controls={`month-content-${group.monthYear}`}
                >
                    <div className="flex items-center justify-between">
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
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 font-bold text-lg">
                                <FontAwesomeIcon
                                    icon={faDollarSign}
                                    className="w-5 h-5 text-primary"
                                />
                                <span>${group.totalAmount.toFixed(2)}</span>
                            </div>
                            <FontAwesomeIcon
                                icon={isExpanded ? faChevronUp : faChevronDown}
                                className="w-4 h-4 text-muted-foreground transition-transform duration-200"
                            />
                        </div>
                    </div>
                </button>

                {isExpanded && (
                    <div
                        id={`month-content-${group.monthYear}`}
                        className="border-t bg-background/50"
                    >
                        <div className="p-4">
                            {shouldUseVirtualScrolling ? (
                                <VirtualPurchaseList
                                    purchases={group.purchases}
                                    onPurchaseSelect={onPurchaseSelect}
                                    height={virtualScrollHeight}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {displayedPurchases.map((purchase) => (
                                        <PurchaseCard
                                            key={purchase._id}
                                            purchase={purchase}
                                            onClick={() => onPurchaseSelect?.(purchase)}
                                        />
                                    ))}
                                    {hasMorePurchases && (
                                        <div className="text-center py-2 text-sm text-muted-foreground">
                                            {t`Showing ${maxVisiblePurchases} of ${group.purchaseCount} purchases`}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

const PurchaseCard = memo(function PurchaseCard({
    purchase,
    onClick
}: {
    purchase: Purchase;
    onClick?: () => void;
}) {
    const { t } = useLingui();

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

    const formattedAmount = useMemo(() =>
        purchase.totalAmount.toFixed(2), [purchase.totalAmount]
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
                            icon={faCalendar}
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
                                <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                                <Plural value={itemCount} one="# item" other="# items" />
                            </div>
                        )}
                        <div className="flex items-center gap-1 font-semibold">
                            <FontAwesomeIcon
                                icon={faDollarSign}
                                className="w-4 h-4 text-primary"
                            />
                            <span>${formattedAmount}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

export function OptimizedMonthlyAccordion({
    monthlyGroups,
    defaultExpandedMonths = [],
    onPurchaseSelect,
    maxVisiblePurchases = 50,
    virtualScrollHeight = 400,
    maxExpandedMonths = 5,
    enablePerformanceMonitoring = false,
    persistExpandedState = false,
}: OptimizedMonthlyAccordionProps) {
    const accordionState = useOptimizedAccordionState({
        maxExpandedItems: maxExpandedMonths,
        defaultExpanded: defaultExpandedMonths,
        persistState: persistExpandedState,
        storageKey: 'monthly-accordion-state',
    });

    const performanceMetrics = useAccordionPerformanceMetrics();

    const toggleMonth = useCallback((monthYear: string) => {
        if (enablePerformanceMonitoring) {
            const start = performance.now();
            accordionState.toggle(monthYear);
            const end = performance.now();
            performanceMetrics.recordToggle(end - start);
        } else {
            accordionState.toggle(monthYear);
        }
    }, [accordionState, enablePerformanceMonitoring, performanceMetrics]);

    const memoizedGroups = useMemo(() =>
        monthlyGroups.map(group => ({
            ...group,
            isExpanded: accordionState.isExpanded(group.monthYear),
        })), [monthlyGroups, accordionState]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            accordionState.cleanup();
        };
    }, [accordionState]);

    // Log performance metrics in development
    useEffect(() => {
        if (enablePerformanceMonitoring && process.env.NODE_ENV === 'development') {
            const interval = setInterval(() => {
                const metrics = performanceMetrics.getMetrics();
                if (metrics.toggleCount > 0) {
                    console.log('Accordion Performance Metrics:', metrics);
                }
            }, 10000); // Log every 10 seconds

            return () => clearInterval(interval);
        }
    }, [enablePerformanceMonitoring, performanceMetrics]);

    if (monthlyGroups.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
                No monthly groups to display
            </div>
        );
    }

    return (
        <div className="space-y-0">
            {memoizedGroups.map((group) => (
                <MonthlyGroupItem
                    key={group.monthYear}
                    group={group}
                    isExpanded={group.isExpanded}
                    onToggle={() => toggleMonth(group.monthYear)}
                    onPurchaseSelect={onPurchaseSelect}
                    maxVisiblePurchases={maxVisiblePurchases}
                    virtualScrollHeight={virtualScrollHeight}
                />
            ))}
        </div>
    );
}