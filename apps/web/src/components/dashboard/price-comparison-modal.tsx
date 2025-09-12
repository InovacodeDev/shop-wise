import React, { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/md3/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Button } from "@/components/md3/button";
import { useLingui } from '@lingui/react/macro';
import { getCurrencyFromLocale } from "@/lib/localeCurrency";
import { format, subMonths } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import type { Locale } from 'date-fns';

const dateLocales: Record<string, Locale> = {
    "pt": ptBR,
    "pt-BR": ptBR,
    "en-US": enUS,
    en: enUS,
};

interface PurchaseItem {
    id: string;
    productRef: any;
    name?: string;
    barcode?: string;
    quantity: number;
    price: number;
    totalPrice: number;
    purchaseDate: Date;
    storeName: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: PurchaseItem | null;
    allItems: PurchaseItem[];
    locale?: string;
}

export function PriceComparisonModal({ open, onOpenChange, item, allItems, locale }: Props) {
    const { i18n, t } = useLingui();
    const [mode, setMode] = useState<'price' | 'quantity'>('price');
    const dateLocale = dateLocales[locale || i18n.locale] || ptBR;

    const months = useMemo(() => {
        const now = new Date();
        const arr: Array<{ date: Date; label: string; monthYear: string; isCurrent: boolean }> = [];
        for (let i = 0; i <= 5; i++) {
            const d = subMonths(now, i);
            arr.push({ date: d, label: format(d, "MMM/yy", { locale: dateLocale }), monthYear: format(d, "yyyy-MM"), isCurrent: i === 0 });
        }
        return arr;
    }, [dateLocale]);

    const matchedData = useMemo(() => {
        if (!item) return [];

        const useBarcode = !!item.barcode;

        // For each month compute avg price and total quantity for the matched product
        const monthMatches = months.map((m) => {
            const monthItems = allItems.filter((it) => {
                const itemMonth = format(it.purchaseDate, "yyyy-MM");
                if (itemMonth !== m.monthYear) return false;
                if (useBarcode && item.barcode) return it.barcode === item.barcode;
                return (it.name && item.name) ? it.name.trim().toLowerCase() === item.name.trim().toLowerCase() : false;
            });

            const totalQty = monthItems.reduce((s, x) => s + (x.quantity || 0), 0);
            const totalSpent = monthItems.reduce((s, x) => s + (x.totalPrice || 0), 0);
            const avgPrice = totalQty > 0 ? (totalSpent / totalQty) : (monthItems.length > 0 ? (monthItems.reduce((s, x) => s + (x.price || 0), 0) / monthItems.length) : 0);

            return {
                monthLabel: m.label + (m.isCurrent ? ` (${t`Current`})` : ""),
                monthYear: m.monthYear,
                isCurrent: m.isCurrent,
                avgPrice,
                totalQty,
                hasPurchase: monthItems.length > 0,
            };
        });

        // Filter out months with no purchases
        return monthMatches.filter(m => m.hasPurchase);
    }, [item, allItems, months, t]);

    // find current month entry if present
    const currentData = matchedData.find(d => d.isCurrent) || null;

    // baseline: the most recent previous month with purchases (closest month before current)
    const baseline = useMemo(() => {
        if (!matchedData || matchedData.length === 0) return null;
        // sort matchedData by monthYear desc to get recency, then find first older than current
        const sorted = [...matchedData].sort((a, b) => b.monthYear.localeCompare(a.monthYear));
        if (!currentData) {
            // no current, baseline is the most recent one
            return sorted[0] || null;
        }
        // find index of current in sorted then take the next one (older)
        const idx = sorted.findIndex(d => d.monthYear === currentData.monthYear);
        if (idx === -1) return sorted[0] || null;
        return sorted[idx + 1] || null;
    }, [matchedData, currentData]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{item ? item.name || item.barcode || t`Product Comparison` : t`Product Comparison`}</DialogTitle>
                </DialogHeader>

                <div className="pt-2 pb-4 px-6">
                    <p className="text-sm text-muted-foreground mb-4">{t`Comparing unit price and quantity for the selected product across the last 6 months.`}</p>

                    {currentData && (
                        <div className="mb-4 p-3 border rounded-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-muted-foreground">{t`Current Month`}</div>
                                    <div className="text-lg font-medium">{currentData.monthLabel}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">{t`Avg Unit Price`}</div>
                                    <div className="text-lg font-bold">{currentData.avgPrice > 0 ? i18n.number(currentData.avgPrice, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) }) : "--"}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">{t`Total Quantity`}</div>
                                    <div className="text-lg font-bold">{currentData.totalQty > 0 ? i18n.number(currentData.totalQty, { maximumFractionDigits: 2 }) : "--"}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">{t`Change vs last purchase month`}</div>
                                    <div className="text-lg font-bold">
                                        {baseline ? (
                                            baseline.avgPrice > 0 ? (
                                                <span className={currentData.avgPrice - baseline.avgPrice > 0 ? "text-destructive" : "text-green-600"}>
                                                    {currentData.avgPrice > 0 ? (currentData.avgPrice - baseline.avgPrice) >= 0 ?
                                                        `${i18n.number((currentData.avgPrice - baseline.avgPrice), { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })} ` :
                                                        `${i18n.number((currentData.avgPrice - baseline.avgPrice), { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })} ` : "--"}
                                                    {currentData.avgPrice > 0 && baseline.avgPrice > 0 ? (
                                                        <span className="ml-2 text-sm">{((currentData.avgPrice - baseline.avgPrice) / (baseline.avgPrice || 1)) > 0 ? '+' : ''}{i18n.number(((currentData.avgPrice - baseline.avgPrice) / (baseline.avgPrice || 1)), { style: 'percent', maximumFractionDigits: 1 })}</span>
                                                    ) : null}
                                                </span>
                                            ) : "--"
                                        ) : t`No previous purchase`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Line chart: 24 months (2 years) of average unit price */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-muted-foreground">{t`Price history (24 months)`}</div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant={"ghost"} onClick={() => setMode('price')} className={mode === 'price' ? 'font-semibold' : ''}>{t`Price`}</Button>
                            <Button size="sm" variant={"ghost"} onClick={() => setMode('quantity')} className={mode === 'quantity' ? 'font-semibold' : ''}>{t`Quantity`}</Button>
                        </div>
                    </div>

                    {(() => {
                        if (!item) return <div className="text-sm text-muted-foreground">{t`No product selected.`}</div>;

                        const now = new Date();

                        const months24: Array<{ monthYear: string; label: string; avgPrice: number | null; totalQty: number }> = [];
                        for (let i = 23; i >= 0; i--) {
                            const d = subMonths(now, i);
                            const monthKey = format(d, 'yyyy-MM');
                            const label = format(d, 'MMM/yy', { locale: dateLocale });

                            const monthItems = allItems.filter((it) => {
                                const itemMonth = format(it.purchaseDate, 'yyyy-MM');
                                if (itemMonth !== monthKey) return false;
                                if (item.barcode) return it.barcode === item.barcode;
                                return (it.name && item.name) ? it.name.trim().toLowerCase() === item.name.trim().toLowerCase() : false;
                            });

                            const totalQty = monthItems.reduce((s, x) => s + (x.quantity || 0), 0);
                            const totalSpent = monthItems.reduce((s, x) => s + (x.totalPrice || 0), 0);
                            const avgPrice = totalQty > 0 ? (totalSpent / totalQty) : (monthItems.length > 0 ? (monthItems.reduce((s, x) => s + (x.price || 0), 0) / monthItems.length) : null);

                            months24.push({ monthYear: monthKey, label, avgPrice: avgPrice ?? null, totalQty });
                        }

                        const chartData = months24.map(m => ({
                            month: m.label,
                            avgPrice: m.avgPrice,
                            totalQty: m.totalQty,
                            hasPrice: m.avgPrice !== null,
                            hasQty: m.totalQty > 0,
                        }));

                        const interpolate = (values: Array<number | null>) => {
                            const n = values.length;
                            const res: Array<number | null> = values.slice();
                            let i = 0;
                            while (i < n) {
                                if (res[i] == null) {
                                    let j = i + 1;
                                    while (j < n && res[j] == null) j++;
                                    const prevIdx = i - 1;
                                    const nextIdx = j < n ? j : -1;
                                    const prevVal = prevIdx >= 0 ? res[prevIdx] : null;
                                    const nextVal = nextIdx !== -1 ? res[nextIdx] : null;

                                    if (prevVal == null && nextVal == null) {
                                        for (let k = i; k < j; k++) res[k] = null;
                                    } else if (prevVal == null) {
                                        for (let k = i; k < j; k++) res[k] = nextVal;
                                    } else if (nextVal == null) {
                                        for (let k = i; k < j; k++) res[k] = prevVal;
                                    } else {
                                        const gap = nextIdx - prevIdx;
                                        for (let k = i; k < j; k++) {
                                            const t = (k - prevIdx) / gap;
                                            res[k] = prevVal + t * (nextVal - prevVal);
                                        }
                                    }
                                    i = j;
                                } else {
                                    i++;
                                }
                            }
                            return res;
                        };

                        const priceValues = months24.map(m => m.avgPrice === null ? null : m.avgPrice);
                        const qtyValues = months24.map(m => m.totalQty > 0 ? m.totalQty : null);
                        const interpPrice = interpolate(priceValues);
                        const interpQty = interpolate(qtyValues);

                        const enriched = chartData.map((d, idx) => ({
                            ...d,
                            interpAvgPrice: interpPrice[idx],
                            interpQty: interpQty[idx],
                        }));

                        const currency = getCurrencyFromLocale(i18n.locale);

                        const CustomTooltip = ({ active, payload, label }: any) => {
                            if (!active || !payload || !payload.length) return null;
                            const point = enriched.find(p => p.month === label);
                            if (!point) return null;
                            const value = mode === 'price' ? point.avgPrice : point.totalQty;
                            const interp = mode === 'price' ? point.interpAvgPrice : point.interpQty;
                            const has = mode === 'price' ? point.hasPrice : point.hasQty;
                            return (
                                <div className="rounded-lg border bg-background p-3 shadow-lg">
                                    <div className="font-medium">{label}</div>
                                    <div className="text-lg font-bold mt-1">
                                        {has ? (mode === 'price' ? (value != null ? i18n.number(value as number, { style: 'currency', currency }) : "--") : i18n.number(value as number, { maximumFractionDigits: 2 })) : (
                                            interp != null ? (
                                                <span>{mode === 'price' ? i18n.number(interp as number, { style: 'currency', currency }) : i18n.number(interp as number, { maximumFractionDigits: 2 })} <span className="text-xs text-muted-foreground">({t`estimate`})</span></span>
                                            ) : t`No data`
                                        )}
                                    </div>
                                </div>
                            );
                        };

                        return (
                            <div style={{ height: 300 }} className="w-full">
                                <ResponsiveContainer>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                        <YAxis tickFormatter={(val) => i18n.number(val as number, { style: 'currency', currency })} />
                                        <Tooltip content={<CustomTooltip />} />
                                        {/* dashed interpolated line behind to show trend for missing months */}
                                        <Line type="monotone" dataKey={mode === 'price' ? 'interpAvgPrice' : 'interpQty'} stroke="#9aaed8" strokeWidth={2} dot={false} strokeDasharray="6 6" connectNulls={true} opacity={0.8} />
                                        <Line type="monotone" dataKey={mode === 'price' ? 'avgPrice' : 'totalQty'} stroke="#1976d2" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        );
                    })()}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default PriceComparisonModal;
