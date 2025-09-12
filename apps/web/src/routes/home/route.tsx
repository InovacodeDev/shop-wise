import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/md3/card";
import { useLingui } from '@lingui/react/macro';
import { getCurrencyFromLocale } from '@/lib/localeCurrency';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import {
    Bar,
    BarChart as RechartsBarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/md3/badge";
import { Chip } from "@/components/md3/chip";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartSimple,
    faDollarSign,
    faShoppingBag,
    faArrowTrendUp,
    faChartColumn,
    faTag,
    faScaleBalanced,
    faHashtag,
    faBarcode,
    faArrowDown,
    faArrowUp,
    faCopyright,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/hooks/use-auth";

import { EmptyState } from "@/components/ui/empty-state";
import { InsightModal } from "@/components/dashboard/insight-modal";
import PriceComparisonModal from "@/components/dashboard/price-comparison-modal";
import { analyzeConsumptionData } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService } from "@/services/api";
import { subMonths, startOfMonth, endOfMonth, format, Locale } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { createFileRoute } from "@tanstack/react-router";
import { SideBarLayout } from '@/components/layout/sidebar-layout';
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/services/analytics-service";

// currency util centralized in src/lib/localeCurrency.ts

interface PurchaseItem {
    id: string;
    productRef: any;
    name?: string;
    barcode?: string;
    volume?: string;
    brand?: string;
    category?: string;
    subcategory?: string;
    quantity: number;
    price: number;
    totalPrice: number;
    purchaseDate: Date;
    storeName: string;
}

const dateLocales: Record<string, Locale> = {
    "pt": ptBR,
    "pt-BR": ptBR,
    "en-US": enUS,
    en: enUS,
};

const categoryMapping: { [key: string]: string } = {
    "Hortifrúti e Ovos": "produce_and_eggs",
    "Açougue e Peixaria": "meat_and_seafood",
    "Padaria e Confeitaria": "bakery_and_deli",
    "Laticínios e Frios": "dairy_and_chilled",
    Mercearia: "pantry_and_dry_goods",
    "Matinais e Doces": "breakfast_and_snacks",
    Congelados: "frozen_foods",
    Bebidas: "beverages",
    Limpeza: "cleaning_and_household",
    "Higiene Pessoal": "personal_care",
    "Bebês e Crianças": "baby_and_child_care",
    "Pet Shop": "pet_supplies",
    "Utilidades e Bazar": "home_and_general",
    Farmácia: "pharmacy",
    Outros: "others",
};

const getCategoryKey = (categoryName: string | undefined) => {
    if (!categoryName) return "others";
    return categoryMapping[categoryName] || "others";
};

const ComparisonBadge = ({ value }: { value: number | null }) => {
    const { i18n, t } = useLingui();
    if (value === null) {
        return <div className="h-4 w-16 bg-muted rounded-md animate-pulse" />;
    }
    const isPositive = value > 0;
    const colorClass = isPositive ? "text-destructive" : "text-green-600 dark:text-green-500";
    const icon = isPositive ? faArrowUp : faArrowDown;

    return (
        <p className={cn("text-xs flex items-center gap-1", colorClass)}>
            <FontAwesomeIcon icon={icon} className="h-3 w-3" />
            <span>
                {isPositive ? "+" : ""}
                {i18n.number(value, { maximumFractionDigits: 1, style: 'percent' })} {t`vs last month`}
            </span>
        </p>
    );
};

export const Route = createFileRoute("/home")({
    component: DashboardPage,
});

function DashboardPage() {
    const { i18n, t } = useLingui();
    const { profile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);

    // States for data
    const [barChartData, setBarChartData] = useState<any[]>([]);
    const [pieChartData, setPieChartData] = useState<any[]>([]);
    const [topExpensesData, setTopExpensesData] = useState<PurchaseItem[]>([]);
    const [allItemsState, setAllItemsState] = useState<PurchaseItem[]>([]);
    const [monthlySpendingByStore, setMonthlySpendingByStore] = useState<any[]>([]);
    const [recentItems, setRecentItems] = useState<PurchaseItem[]>([]);
    const [spendingByCategory, setSpendingByCategory] = useState<any[]>([]);
    const [translatedSpendingByCategory, setTranslatedSpendingByCategory] = useState<any[]>([]);
    const [totalSpentMonth, setTotalSpentMonth] = useState<number | null>(null);
    const [totalItemsBought, setTotalItemsBought] = useState<number | null>(null);

    // States for comparison and insights
    const [totalSpentChange, setTotalSpentChange] = useState<number | null>(null);
    const [totalItemsChange, setTotalItemsChange] = useState<number | null>(null);
    const [currentMonthName, setCurrentMonthName] = useState<string>("");
    const [historicalInsights, setHistoricalInsights] = useState<{
        avgMonthlySpending: number;
        avgMonthlyItems: number;
        topCategoryTrend: string;
        spendingTrend: 'increasing' | 'decreasing' | 'stable';
    } | null>(null);

    // AI analysis states
    const [consumptionAnalysis, setConsumptionAnalysis] = useState<string | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    // Goals summary state (merged into Insights)
    const [goals, setGoals] = useState<any[]>([]);
    const [goalProgress, setGoalProgress] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<PurchaseItem | null>(null);
    const [isComparisonOpen, setIsComparisonOpen] = useState(false);

    const chartConfig = useMemo<any>(
        () => ({
            total: { label: t`Total` },
            produce_and_eggs: {
                label: t`Produce and Eggs`,
                color: "hsl(var(--color-category-produce-and-eggs))",
            },
            meat_and_seafood: {
                label: t`Meat and Seafood`,
                color: "hsl(var(--color-category-meat-and-seafood))",
            },
            bakery_and_deli: {
                label: t`Bakery and Deli`,
                color: "hsl(var(--color-category-bakery-and-deli))",
            },
            dairy_and_chilled: {
                label: t`Dairy and Chilled`,
                color: "hsl(var(--color-category-dairy-and-chilled))",
            },
            pantry_and_dry_goods: {
                label: t`Pnatry and Dry goods`,
                color: "hsl(var(--color-category-pantry-and-dry-goods))",
            },
            breakfast_and_snacks: {
                label: t`Breakfast and Snacks`,
                color: "hsl(var(--color-category-breakfast-and-snacks))",
            },
            frozen_foods: { label: t`Frozen foods`, color: "hsl(var(--color-category-frozen-foods))" },
            beverages: { label: t`Beverages`, color: "hsl(var(--color-category-beverages))" },
            cleaning_and_household: {
                label: t`Cleaning and household`,
                color: "hsl(var(--color-category-cleaning-and-household))",
            },
            personal_care: { label: t`Personal care`, color: "hsl(var(--color-category-personal-care))" },
            baby_and_child_care: {
                label: t`Baby and Child care`,
                color: "hsl(var(--color-category-baby-and-child-care))",
            },
            pet_supplies: { label: t`Pet supplies`, color: "hsl(var(--color-category-pet-supplies))" },
            home_and_general: {
                label: t`Home and General`,
                color: "hsl(var(--color-category-home-and-general))",
            },
            pharmacy: { label: t`Pharmacy`, color: "hsl(var(--color-category-pharmacy))" },
            others: { label: t`Others`, color: "hsl(var(--muted))" },
            value: { label: t`Spending` },
        }),
        [t]
    );

    useEffect(() => {
        async function fetchData() {
            if (!profile || !profile.familyId) {
                setLoading(false);
                return;
            }

            setLoading(true);

            const now = new Date();
            const locale = dateLocales[i18n.locale] || ptBR;

            // Set current month name for display
            setCurrentMonthName(format(now, "MMMM yyyy", { locale }));

            // 1. Fetch all family purchase items data using the optimized endpoint
            let allFamilyPurchaseItems: any = {};
            let monthlyGroups: any[] = [];
            try {
                allFamilyPurchaseItems = await apiService.getAllFamilyPurchaseItems(profile.familyId);
                monthlyGroups = await apiService.getPurchasesByMonth(profile.familyId);
                console.log({ allFamilyPurchaseItems, monthlyGroups });
            } catch (error) {
                console.error("Failed to fetch family purchase data:", error);
                setLoading(false);
                return;
            }

            let allItems: PurchaseItem[] = [];

            // 2. Process allFamilyPurchaseItems data structure to create PurchaseItem array
            Object.entries(allFamilyPurchaseItems).forEach(([monthYear, monthData]: [string, any]) => {
                Object.entries(monthData).forEach(([purchaseId, purchaseData]: [string, any]) => {
                    const { purchaseInfo, items } = purchaseData;

                    items.forEach((item: any) => {
                        const purchaseItem: PurchaseItem = {
                            id: item.productId, // Using productId as unique identifier
                            productRef: { id: item.productId },
                            quantity: item.quantity,
                            price: item.price,
                            totalPrice: item.total,
                            purchaseDate: new Date(purchaseInfo.date),
                            storeName: purchaseInfo.storeName || 'Unknown Store',
                            name: item.name,
                            barcode: item.barcode,
                            volume: item.unit, // Using 'unit' field as volume
                            brand: item.brand,
                            category: item.category,
                            subcategory: item.subCategory,
                        };

                        allItems.push(purchaseItem);
                    });
                });
            });

            // persist allItems so comparison modal can use the historical dataset
            setAllItemsState(allItems);

            // 3. Consolidate items
            const consolidatedItemsMap = new Map<string, PurchaseItem>();
            allItems.forEach((item) => {
                const key = item.productRef.id;
                if (consolidatedItemsMap.has(key)) {
                    const existingItem = consolidatedItemsMap.get(key)!;
                    existingItem.quantity += item.quantity;
                    existingItem.totalPrice += item.totalPrice;
                    // Keep the latest purchase date for recency
                    if (item.purchaseDate > existingItem.purchaseDate) {
                        existingItem.purchaseDate = item.purchaseDate;
                    }
                } else {
                    consolidatedItemsMap.set(key, { ...item });
                }
            });

            // Recalculate average price for consolidated items
            consolidatedItemsMap.forEach((item) => {
                if (item.quantity > 0) {
                    item.price = item.totalPrice / item.quantity;
                }
            });

            const consolidatedItems = Array.from(consolidatedItemsMap.values());

            const startOfThisMonth = startOfMonth(now);
            const endOfThisMonth = endOfMonth(now);
            const startOfLastMonth = startOfMonth(subMonths(now, 1));
            const endOfLastMonth = endOfMonth(subMonths(now, 1));

            // -- Process current month data --
            const thisMonthItems = allItems.filter(
                (item) => item.purchaseDate >= startOfThisMonth && item.purchaseDate <= endOfThisMonth
            );
            const thisMonthTotalSpent = thisMonthItems.reduce((acc, item) => acc + item.totalPrice, 0);
            const thisMonthTotalItems = thisMonthItems.reduce((acc, item) => acc + item.quantity, 0);

            // -- Process last month data for comparison --
            const lastMonthItems = allItems.filter(
                (item) => item.purchaseDate >= startOfLastMonth && item.purchaseDate <= endOfLastMonth
            );
            const lastMonthTotalSpent = lastMonthItems.reduce((acc, item) => acc + item.totalPrice, 0);
            const lastMonthTotalItems = lastMonthItems.reduce((acc, item) => acc + item.quantity, 0);

            // -- Enhanced comparison using monthly groups data if available --
            let finalTotalSpentChange = 0;
            let finalTotalItemsChange = 0;

            if (monthlyGroups.length >= 2) {
                // Use monthly groups for more accurate comparison
                const currentMonthKey = format(now, "yyyy-MM");
                const lastMonthKey = format(subMonths(now, 1), "yyyy-MM");

                const currentMonthGroup = monthlyGroups.find(g => g.monthYear === currentMonthKey);
                const lastMonthGroup = monthlyGroups.find(g => g.monthYear === lastMonthKey);

                if (currentMonthGroup && lastMonthGroup) {
                    finalTotalSpentChange = lastMonthGroup.totalAmount > 0
                        ? ((currentMonthGroup.totalAmount - lastMonthGroup.totalAmount) / lastMonthGroup.totalAmount)
                        : currentMonthGroup.totalAmount > 0 ? 1 : 0;

                    finalTotalItemsChange = lastMonthGroup.purchaseCount > 0
                        ? ((currentMonthGroup.purchaseCount - lastMonthGroup.purchaseCount) / lastMonthGroup.purchaseCount)
                        : currentMonthGroup.purchaseCount > 0 ? 1 : 0;
                } else {
                    // Fallback to item-based calculation
                    finalTotalSpentChange = lastMonthTotalSpent > 0
                        ? ((thisMonthTotalSpent - lastMonthTotalSpent) / lastMonthTotalSpent)
                        : thisMonthTotalSpent > 0 ? 1 : 0;
                    finalTotalItemsChange = lastMonthTotalItems > 0
                        ? ((thisMonthTotalItems - lastMonthTotalItems) / lastMonthTotalItems)
                        : thisMonthTotalItems > 0 ? 1 : 0;
                }
            } else {
                // Fallback to item-based calculation
                finalTotalSpentChange = lastMonthTotalSpent > 0
                    ? ((thisMonthTotalSpent - lastMonthTotalSpent) / lastMonthTotalSpent)
                    : thisMonthTotalSpent > 0 ? 1 : 0;
                finalTotalItemsChange = lastMonthTotalItems > 0
                    ? ((thisMonthTotalItems - lastMonthTotalItems) / lastMonthTotalItems)
                    : thisMonthTotalItems > 0 ? 1 : 0;
            }

            setTotalSpentChange(finalTotalSpentChange);
            setTotalItemsChange(finalTotalItemsChange);

            // -- Process Bar Chart data: Current month + Last 5 months (6 months total) --
            const monthlyData: { [key: string]: any } = {};
            const currentMonthKey = format(now, "MMM/yy", { locale });

            // Generate 6 months: current month + last 5 months
            const targetMonths: Array<{ date: Date; monthKey: string; monthYear: string; isCurrentMonth: boolean }> = [];
            for (let i = 5; i >= 0; i--) {
                const date = subMonths(now, i);
                const monthKey = format(date, "MMM/yy", { locale });
                const monthYear = format(date, "yyyy-MM");
                const isCurrentMonth = i === 0;
                targetMonths.push({ date, monthKey, monthYear, isCurrentMonth });
            }

            // Initialize chart data for these 6 months
            targetMonths.forEach(({ monthKey, monthYear, isCurrentMonth }) => {
                // Find matching data from monthlyGroups if available
                const groupData = monthlyGroups.find(group => group.monthYear === monthYear);

                monthlyData[monthKey] = {
                    month: monthKey,
                    monthYear: monthYear,
                    totalAmount: groupData?.totalAmount || 0,
                    purchaseCount: groupData?.purchaseCount || 0,
                    isCurrentMonth: isCurrentMonth,
                    displayName: isCurrentMonth ? `${monthKey} (${t`Current`})` : monthKey,
                    ...Object.fromEntries(
                        Object.keys(chartConfig)
                            .filter((k) => !["total", "value"].includes(k))
                            .map((k) => [k, 0])
                    ),
                };
            });

            // Populate category spending data for each month using items
            // but keep the total amount from monthlyGroups to avoid discrepancies
            allItems.forEach((item) => {
                const monthKey = format(item.purchaseDate, "MMM/yy", { locale });
                if (monthlyData[monthKey]) {
                    const categoryKey = getCategoryKey(item.category);
                    monthlyData[monthKey][categoryKey] = (monthlyData[monthKey][categoryKey] || 0) + item.totalPrice;
                }
            });

            // Adjust category totals to match the correct totalAmount from monthlyGroups
            Object.values(monthlyData).forEach((month: any) => {
                const categoryKeys = Object.keys(chartConfig).filter((k) => !["total", "value"].includes(k));
                const categoriesTotal = categoryKeys.reduce((sum, key) => sum + (month[key] || 0), 0);
                const correctTotal = month.totalAmount || 0;
                const difference = correctTotal - categoriesTotal;
                
                // If there's a significant difference, add it to "others" category
                if (difference > 0.01) {
                    month.others = (month.others || 0) + difference;
                    if (month.isCurrentMonth) {
                        console.log(`Adjusted monthly data for ${month.monthYear}: categoriesTotal=${categoriesTotal}, correctTotal=${correctTotal}, difference=${difference}`);
                    }
                }
            });

            console.log(Object.values(monthlyData)); // Debug log to verify data structure
            setBarChartData(Object.values(monthlyData));

            // -- Process Pie Chart data (this month) --
            const thisMonthCategorySpending = thisMonthItems.reduce((acc, item) => {
                const categoryKey = getCategoryKey(item.category);
                acc[categoryKey] = (acc[categoryKey] || 0) + item.totalPrice;
                return acc;
            }, {} as { [key: string]: number });

            // Calculate total from items and compare with correct total from monthlyGroups
            const itemsTotal = Object.values(thisMonthCategorySpending).reduce((sum, value) => sum + value, 0);
            const currentMonthKey2 = format(now, "yyyy-MM");
            const currentMonthGroup2 = monthlyGroups.find(g => g.monthYear === currentMonthKey2);
            const correctTotal = currentMonthGroup2?.totalAmount || itemsTotal;
            
            // If there's a difference, add it to "others" category to match the correct total
            const difference = correctTotal - itemsTotal;
            if (difference > 0.01) { // Only adjust if difference is significant (more than 1 cent)
                thisMonthCategorySpending.others = (thisMonthCategorySpending.others || 0) + difference;
                console.log(`Adjusted categories total: itemsTotal=${itemsTotal}, correctTotal=${correctTotal}, difference=${difference}`);
            }

            const pieData = Object.entries(thisMonthCategorySpending).map(([category, value]) => ({
                category,
                value,
                fill: (chartConfig[category as keyof typeof chartConfig] as any)?.color || chartConfig["others"].color,
            }));
            setPieChartData(pieData);
            setSpendingByCategory(Object.entries(thisMonthCategorySpending).map(([name, value]) => ({ name, value })));

            // -- Process Top Expenses (this month, with historical context) --
            const thisMonthConsolidatedItems = consolidatedItems.filter(
                (item) => item.purchaseDate >= startOfThisMonth && item.purchaseDate <= endOfThisMonth
            );

            // Enhanced top expenses with frequency analysis across all months
            const productFrequency = new Map<string, { count: number, totalSpent: number, avgPrice: number }>();
            allItems.forEach(item => {
                const key = item.productRef.id;
                const existing = productFrequency.get(key) || { count: 0, totalSpent: 0, avgPrice: 0 };
                existing.count += 1;
                existing.totalSpent += item.totalPrice;
                existing.avgPrice = existing.totalSpent / existing.count;
                productFrequency.set(key, existing);
            });

            // Enhance current month items with historical context
            const enhancedThisMonthItems = thisMonthConsolidatedItems.map(item => ({
                ...item,
                historicalFrequency: productFrequency.get(item.productRef.id)?.count || 1,
                historicalTotalSpent: productFrequency.get(item.productRef.id)?.totalSpent || item.totalPrice,
                historicalAvgPrice: productFrequency.get(item.productRef.id)?.avgPrice || item.price
            }));

            const top5Expenses = [...enhancedThisMonthItems]
                .sort((a, b) => b.totalPrice - a.totalPrice)
                .slice(0, 5);
            setTopExpensesData(top5Expenses);

            // -- Process other card data --
            // Use the correct total from monthlyGroups instead of calculated from items
            const currentMonthYearKey = format(now, "yyyy-MM");
            const currentMonthGroup = monthlyGroups.find(g => g.monthYear === currentMonthYearKey);
            const correctTotalSpent = currentMonthGroup?.totalAmount || thisMonthTotalSpent;
            
            setTotalSpentMonth(correctTotalSpent);
            setTotalItemsBought(thisMonthTotalItems);
            setRecentItems(
                [...thisMonthItems].sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime()).slice(0, 10)
            );

            // -- Enhanced Monthly Spending By Store with historical context --
            const spendingByStore = thisMonthItems.reduce((acc, item) => {
                acc[item.storeName] = (acc[item.storeName] || 0) + item.totalPrice;
                return acc;
            }, {} as { [key: string]: number });

            // Add historical average for comparison
            const historicalStoreSpending = allItems.reduce((acc, item) => {
                const monthKey = format(item.purchaseDate, "yyyy-MM");
                if (!acc[item.storeName]) acc[item.storeName] = {};
                acc[item.storeName][monthKey] = (acc[item.storeName][monthKey] || 0) + item.totalPrice;
                return acc;
            }, {} as { [store: string]: { [month: string]: number } });

            const enhancedStoreData = Object.entries(spendingByStore).map(([name, value]) => {
                const storeHistory = historicalStoreSpending[name] || {};
                const monthlyTotals = Object.values(storeHistory);
                const avgMonthlySpending = monthlyTotals.length > 0
                    ? monthlyTotals.reduce((sum, val) => sum + val, 0) / monthlyTotals.length
                    : value;

                return {
                    name,
                    value,
                    historicalAverage: avgMonthlySpending,
                    monthsActive: monthlyTotals.length
                };
            });

            setMonthlySpendingByStore(enhancedStoreData);

            // Fetch goals and progress to merge into the dashboard
            try {
                // const [g, p] = await Promise.all([
                //     apiService.getGoals(),
                //     apiService.getGoalProgress(),
                // ]);
                // setGoals(g);
                // setGoalProgress(p);
            } catch (err) {
                // ignore errors for goals fetching so insights still render
            }

            // -- Generate Historical Insights --
            if (monthlyGroups.length > 1) {
                const historicalMonths = monthlyGroups.filter(g => g.monthYear !== format(now, "yyyy-MM"));
                const avgSpending = historicalMonths.reduce((sum, g) => sum + g.totalAmount, 0) / historicalMonths.length;
                const avgItems = historicalMonths.reduce((sum, g) => sum + g.purchaseCount, 0) / historicalMonths.length;

                // Analyze spending trend (last 3 months)
                const recentMonths = [...monthlyGroups]
                    .sort((a, b) => b.monthYear.localeCompare(a.monthYear))
                    .slice(0, 3);

                let spendingTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
                if (recentMonths.length >= 3) {
                    const [current, prev1, prev2] = recentMonths;
                    const trend1 = current.totalAmount - prev1.totalAmount;
                    const trend2 = prev1.totalAmount - prev2.totalAmount;

                    if (trend1 > 0 && trend2 > 0) spendingTrend = 'increasing';
                    else if (trend1 < 0 && trend2 < 0) spendingTrend = 'decreasing';
                }

                // Find most frequent category across all months
                const categoryFrequency = new Map<string, number>();
                allItems.forEach(item => {
                    const categoryKey = getCategoryKey(item.category);
                    categoryFrequency.set(categoryKey, (categoryFrequency.get(categoryKey) || 0) + item.totalPrice);
                });

                const topHistoricalCategory = Array.from(categoryFrequency.entries())
                    .sort(([, a], [, b]) => b - a)[0];

                setHistoricalInsights({
                    avgMonthlySpending: avgSpending,
                    avgMonthlyItems: avgItems,
                    topCategoryTrend: topHistoricalCategory ? chartConfig[topHistoricalCategory[0]]?.label || 'Others' : 'Others',
                    spendingTrend
                });
            }

            setLoading(false);
        }
        fetchData();
    }, [profile, i18n.locale, chartConfig]);

    useEffect(() => {
        const translatedData = spendingByCategory.map((item) => ({
            ...item,
            name: chartConfig[item.name as keyof typeof chartConfig]?.label || item.name,
        }));
        setTranslatedSpendingByCategory(translatedData);
    }, [spendingByCategory, chartConfig, i18n.locale]);

    const handleConsumptionAnalysis = async () => {
        if (consumptionAnalysis || profile?.plan !== "premium" || barChartData.length === 0) return;
        setIsAnalysisLoading(true);
        trackEvent("consumption_analysis_requested");
        try {
            // Enhanced data for AI analysis including monthly summaries and trends
            const dataForAI = barChartData.map((monthData) => {
                const translatedData: { [key: string]: any } = {
                    month: monthData.month,
                    totalAmount: monthData.totalAmount || 0,
                    purchaseCount: monthData.purchaseCount || 0,
                    monthYear: monthData.monthYear
                };

                // Add category spending data with translated labels
                for (const key in monthData) {
                    if (!["month", "totalAmount", "purchaseCount", "monthYear"].includes(key)) {
                        const translatedKey = chartConfig[key as keyof typeof chartConfig]?.label || key;
                        translatedData[translatedKey] = monthData[key];
                    }
                }
                return translatedData;
            });

            // Add summary statistics for better AI analysis
            const totalSpending = barChartData.reduce((sum, month) => sum + (month.totalAmount || 0), 0);
            const averageMonthlySpending = totalSpending / Math.max(barChartData.length, 1);
            const totalPurchases = barChartData.reduce((sum, month) => sum + (month.purchaseCount || 0), 0);

            const analysisPayload = {
                monthlyData: dataForAI,
                summary: {
                    totalSpending,
                    averageMonthlySpending,
                    totalPurchases,
                    monthsAnalyzed: barChartData.length,
                    topCategory: topCategory.name,
                    topCategoryPercentage: topCategoryPercent,
                }
            };

            const result = await analyzeConsumptionData({
                consumptionData: JSON.stringify(analysisPayload),
                language: i18n.locale,
            });

            if (result.error) {
                throw new Error(result.error);
            }

            setConsumptionAnalysis(result.analysis);
        } catch (error: any) {
            console.error("Error fetching consumption analysis:", error);
            toast({
                variant: "destructive",
                title: t`Error`,
                description: error.message || t`Error fetching consumption analysis.`,
            });
        } finally {
            setIsAnalysisLoading(false);
        }
    };

    const topCategory = useMemo(() => {
        if (translatedSpendingByCategory.length === 0) return { name: t`Others`, value: 0 };
        return translatedSpendingByCategory.reduce((prev, current) => (prev.value > current.value ? prev : current));
    }, [translatedSpendingByCategory, t]);

    // compute percentage string for the top category relative to the month's total
    const topCategoryPercent = totalSpentMonth && totalSpentMonth > 0 ? ((topCategory.value / totalSpentMonth)) : 0;

    const getCategoryClass = (category?: string) => {
        if (!category) return "bg-secondary text-secondary-foreground";
        const categoryKey = getCategoryKey(category);
        const categoryMap: { [key: string]: string } = {
            produce_and_eggs:
                "bg-category-produce-and-eggs/50 text-category-produce-and-eggs-foreground border-category-produce-and-eggs/20",
            meat_and_seafood:
                "bg-category-meat-and-seafood/50 text-category-meat-and-seafood-foreground border-category-meat-and-seafood/20",
            bakery_and_deli:
                "bg-category-bakery-and-deli/50 text-category-bakery-and-deli-foreground border-category-bakery-and-deli/20",
            dairy_and_chilled:
                "bg-category-dairy-and-chilled/50 text-category-dairy-and-chilled-foreground border-category-dairy-and-chilled/20",
            pantry_and_dry_goods:
                "bg-category-pantry-and-dry-goods/50 text-category-pantry-and-dry-goods-foreground border-category-pantry-and-dry-goods/20",
            breakfast_and_snacks:
                "bg-category-breakfast-and-snacks/50 text-category-breakfast-and-snacks-foreground border-category-breakfast-and-snacks/20",
            frozen_foods:
                "bg-category-frozen-foods/50 text-category-frozen-foods-foreground border-category-frozen-foods/20",
            beverages: "bg-category-beverages/50 text-category-beverages-foreground border-category-beverages/20",
            cleaning_and_household:
                "bg-category-cleaning-and-household/50 text-category-cleaning-and-household-foreground border-category-cleaning-and-household/20",
            personal_care:
                "bg-category-personal-care/50 text-category-personal-care-foreground border-category-personal-care/20",
            baby_and_child_care:
                "bg-category-baby-and-child-care/50 text-category-baby-and-child-care-foreground border-category-baby-and-child-care/20",
            pet_supplies:
                "bg-category-pet-supplies/50 text-category-pet-supplies-foreground border-category-pet-supplies/20",
            home_and_general:
                "bg-category-home-and-general/50 text-category-home-and-general-foreground border-category-home-and-general/20",
            pharmacy: "bg-category-pharmacy/50 text-category-pharmacy-foreground border-category-pharmacy/20",
            Default: "bg-secondary text-secondary-foreground",
        };
        return categoryMap[categoryKey] || categoryMap.Default;
    };

    if (loading) {
        return (
            <SideBarLayout>
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-[108px]" />
                        ))}
                    </div>
                    <Skeleton className="h-[434px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </SideBarLayout>
        );
    }

    return (
        <SideBarLayout>
            <div className="container mx-auto pt-4">
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <InsightModal
                            title={t`Monthly Spending by Store - ${currentMonthName}`}
                            description={t`A breakdown of your total spending for ${currentMonthName} by store.`}
                            data={monthlySpendingByStore}
                            type="spendingByStore"
                        >
                            <Card
                                variant="elevated"
                                className="transition-all duration-300 ease-in-out"
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t`Total Spending`}
                                    </CardTitle>
                                    <FontAwesomeIcon icon={faDollarSign} className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {i18n.number(
                                            totalSpentMonth ?? 0,
                                            {
                                                style: 'currency',
                                                currencySign: 'accounting',
                                                currency: getCurrencyFromLocale(i18n.locale),
                                            }
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-1">{currentMonthName}</div>
                                    <ComparisonBadge value={totalSpentChange} />
                                    {historicalInsights && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t`Avg: ${i18n.number(
                                                historicalInsights.avgMonthlySpending,
                                                {
                                                    style: 'currency',
                                                    currencySign: 'accounting',
                                                    currency: getCurrencyFromLocale(i18n.locale),
                                                }
                                            )}/month`}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </InsightModal>

                        <InsightModal
                            title={t`Recently Purchased Items - ${currentMonthName}`}
                            description={t`A list of the most recent items you purchased in ${currentMonthName}.`}
                            data={recentItems}
                            type="recentItems"
                        >
                            <Card
                                variant="elevated"
                                className="transition-all duration-300 ease-in-out"
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{t`Items Purchased`}</CardTitle>
                                    <FontAwesomeIcon icon={faShoppingBag} className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {i18n.number(totalItemsBought ?? 0, { maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-1">{currentMonthName}</div>
                                    <ComparisonBadge value={totalItemsChange} />
                                    {historicalInsights && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t`Avg: ${i18n.number(
                                                historicalInsights.avgMonthlyItems,
                                                { maximumFractionDigits: 0 },
                                            )} items/month`}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </InsightModal>

                        <InsightModal
                            title={t`Spending by Category - ${currentMonthName}`}
                            description={t`A detailed view of how your spending is distributed across product categories in ${currentMonthName}.`}
                            data={translatedSpendingByCategory}
                            chartData={pieChartData}
                            chartConfig={chartConfig}
                            type="topCategories"
                        >
                            <Card className="transition-transform duration-300 ease-in-out hover:scale-102 hover:shadow-xl">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{t`Top Category`}</CardTitle>
                                    <FontAwesomeIcon icon={faChartSimple} className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{topCategory.name}</div>
                                    <div className="text-xs text-muted-foreground mb-1">{currentMonthName}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {t`${i18n.number(
                                            topCategoryPercent,
                                            {
                                                style: 'percent',
                                                maximumFractionDigits: 1,
                                            }
                                        )} of total spending`}
                                    </p>
                                    {historicalInsights && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t`Historical top: ${historicalInsights.topCategoryTrend}`}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </InsightModal>

                        <InsightModal
                            title={t`Spending Trend - ${currentMonthName}`}
                            description={t`Analysis of your spending patterns and trends based on historical data.`}
                            data={[]}
                            type="savingsOpportunities"
                        >
                            <Card className="transition-transform duration-300 ease-in-out hover:scale-102 hover:shadow-xl">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {t`Spending Trend`}
                                    </CardTitle>
                                    <FontAwesomeIcon icon={faArrowTrendUp} className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {historicalInsights?.spendingTrend === 'increasing' && (
                                            <span className="text-orange-600">↗ {t`Increasing`}</span>
                                        )}
                                        {historicalInsights?.spendingTrend === 'decreasing' && (
                                            <span className="text-green-600">↘ {t`Decreasing`}</span>
                                        )}
                                        {historicalInsights?.spendingTrend === 'stable' && (
                                            <span className="text-blue-600">→ {t`Stable`}</span>
                                        )}
                                        {!historicalInsights && <span className="text-muted-foreground">{t`--`}</span>}
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-1">{t`Last 3 months`}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {historicalInsights ? t`Based on spending pattern analysis` : t`Need more data for analysis`}
                                    </p>
                                </CardContent>
                            </Card>
                        </InsightModal>

                        {/* <InsightModal
                            title={t`Goals Summary`}
                            description={t`Overview of your active goals and their progress.`}
                            data={goals}
                            type="goalsSummary"
                        >
                            <Card className="transition-transform duration-300 ease-in-out hover:scale-102 hover:shadow-xl">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{t`Goals`}</CardTitle>
                                    <FontAwesomeIcon icon={faChartColumn} className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {goals.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">{t`No active goals`}</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {goals.slice(0, 3).map((g) => {
                                                const pr = goalProgress.find((x) => x.goalId === g._id);
                                                return (
                                                    <div key={g._id} className="rounded border p-2">
                                                        <div className="font-medium">{g.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {t`Target`}: {i18n.number(g.targetAmount, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}
                                                            &nbsp;•&nbsp;{t`Current`}: {i18n.number(g.currentAmount, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}
                                                        </div>
                                                        {pr && (
                                                            <div className="text-xs text-muted-foreground">{t`Progress`}: {pr.progressPercentage.toFixed(1)}%</div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </InsightModal> */}
                    </div>

                    <div className="grid gap-6">
                        <InsightModal
                            title={t`Consumption Overview - Through ${currentMonthName}`}
                            description={t`Your spending behavior over time, with current focus on ${currentMonthName}.`}
                            type="consumptionAnalysis"
                            analysis={consumptionAnalysis}
                            isLoading={isAnalysisLoading}
                            onOpen={handleConsumptionAnalysis}
                            data={barChartData}
                            isPremium={profile?.plan === "premium"}
                        >
                            <Card className="transition-transform duration-300 ease-in-out hover:scale-102 hover:shadow-xl col-span-1 lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {t`Consumption Overview`}
                                        <span className="text-sm font-normal text-muted-foreground">
                                            ({t`Current: ${currentMonthName}`})
                                        </span>
                                    </CardTitle>
                                    <CardDescription>{t`Your spending behavior through ${currentMonthName}. Current month is highlighted.`}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {barChartData.length > 0 ? (
                                        <ChartContainer config={chartConfig} className="h-[350px] w-full">
                                            <ResponsiveContainer>
                                                <RechartsBarChart data={barChartData} stackOffset="sign">
                                                    <XAxis
                                                        dataKey="displayName"
                                                        stroke="#888888"
                                                        fontSize={12}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        interval={0}
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={80}
                                                    />
                                                    <YAxis
                                                        stroke="#888888"
                                                        fontSize={12}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={(value) => i18n.number(value as number, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}
                                                    />
                                                    <ChartTooltip
                                                        cursor={{ fill: 'rgba(0, 0, 0, 0.1)', stroke: 'rgba(0, 0, 0, 0.2)', strokeWidth: 1 }}
                                                        content={({ active, payload, label }) => {
                                                            if (!active || !payload || !payload.length) return null;

                                                            const monthData = barChartData.find(d => d.displayName === label);
                                                            const purchaseCount = monthData?.purchaseCount || 0;

                                                            const calculatedTotal = payload.reduce((sum, entry) => {
                                                                return sum + (typeof entry.value === 'number' ? entry.value : 0);
                                                            }, 0);

                                                            const displayTotal = calculatedTotal;

                                                            const allTotals = barChartData.map(d => {
                                                                const monthTotal = Object.keys(chartConfig)
                                                                    .filter(k => !["total", "value"].includes(k))
                                                                    .reduce((sum, key) => sum + (d[key] || 0), 0);
                                                                return monthTotal;
                                                            }).filter(t => t > 0);
                                                            const avgSpending = allTotals.length > 0 ? allTotals.reduce((sum, val) => sum + val, 0) / allTotals.length : 0;

                                                            return (
                                                                <div className="rounded-lg border bg-background p-3 shadow-lg min-w-[280px]">
                                                                    <div className="mb-3">
                                                                        <p className="font-medium text-foreground">
                                                                            {typeof label === 'string' && label.includes('(Current)')
                                                                                ? `${label} - ${t`This Month`}`
                                                                                : label}
                                                                        </p>
                                                                        <p className="text-xl font-bold text-primary">
                                                                            {i18n.number(displayTotal, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}
                                                                        </p>
                                                                        <div className="flex items-center gap-4 mt-1">
                                                                            {purchaseCount > 0 && (
                                                                                <p className="text-sm text-muted-foreground">
                                                                                    {t`${purchaseCount} purchases`}
                                                                                </p>
                                                                            )}
                                                                            {avgSpending > 0 && displayTotal > 0 && (
                                                                                <p className="text-sm text-muted-foreground">
                                                                                    {displayTotal > avgSpending
                                                                                        ? `+${((displayTotal - avgSpending) / avgSpending * 100).toFixed(0)}% ${t`vs avg`}`
                                                                                        : `${((displayTotal - avgSpending) / avgSpending * 100).toFixed(0)}% ${t`vs avg`}`
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {payload.some((entry) => entry.value && (entry.value as number) > 0) && (
                                                                        <div className="space-y-1 border-t pt-2">
                                                                            <p className="text-xs font-medium text-muted-foreground mb-2">{t`Category Breakdown:`}</p>
                                                                            {payload
                                                                                .filter(entry => entry.value && (entry.value as number) > 0)
                                                                                .sort((a, b) => (b.value as number) - (a.value as number))
                                                                                .map((entry, index) => {
                                                                                    const entryValue = entry.value as number;
                                                                                    const percentage = displayTotal > 0 ? ((entryValue / displayTotal)) : 0;
                                                                                    return (
                                                                                        <div key={index} className="flex items-center justify-between gap-3">
                                                                                            <div className="flex items-center gap-2 flex-1">
                                                                                                <div
                                                                                                    className="h-3 w-3 rounded-sm flex-shrink-0"
                                                                                                    style={{ backgroundColor: entry.color }}
                                                                                                />
                                                                                                <span className="text-sm truncate">{entry.name}</span>
                                                                                            </div>
                                                                                            <div className="text-right">
                                                                                                <span className="text-sm font-medium">
                                                                                                    {i18n.number(entryValue, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}
                                                                                                </span>
                                                                                                <span className="text-xs text-muted-foreground ml-1">
                                                                                                    {i18n.number(percentage, { style: 'percent', maximumFractionDigits: 1 })}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            <div className="border-t pt-1 mt-2">
                                                                                <div className="flex items-center justify-between gap-3">
                                                                                    <span className="text-sm font-medium">{t`Total:`}</span>
                                                                                    <span className="text-sm font-bold">
                                                                                        {i18n.number(displayTotal, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <ChartLegend content={<ChartLegendContent />} />
                                                    {Object.keys(chartConfig)
                                                        .filter((k) => !["total", "value"].includes(k))
                                                        .map((key) => (
                                                            <Bar
                                                                key={key}
                                                                dataKey={key}
                                                                fill={(chartConfig[key as keyof typeof chartConfig] as any).color}
                                                                stackId="a"
                                                                radius={key === "others" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                                            />
                                                        ))}
                                                </RechartsBarChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    ) : (
                                        <EmptyState
                                            title={t`Insufficient Data`}
                                            description={t`Start adding purchases to see your spending analysis.`}
                                            className="h-[350px]"
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </InsightModal>
                    </div>

                    <Card className="transition-transform duration-300 ease-in-out hover:scale-102 hover:shadow-xl col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faChartSimple} className="h-5 w-5 text-primary" />
                                {t`Top Expenses - ${currentMonthName}`}
                            </CardTitle>
                            <CardDescription>{t`Products that had the biggest impact on your budget in ${currentMonthName}.`}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topExpensesData.length > 0 ? (
                                <div className="rounded-lg border border-outline-variant bg-surface">
                                    <div className="p-4 border-b border-outline-variant bg-surface-variant/30">
                                        <div className="grid grid-cols-7 gap-4 text-sm font-medium text-on-surface-variant">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faBarcode} className="h-3 w-3" />
                                                {t`Barcode`}
                                            </div>
                                            <div>{t`Product`}</div>
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faCopyright} className="h-3 w-3" />
                                                {t`Brand`}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faTag} className="h-3 w-3" />
                                                {t`Category`}
                                            </div>
                                            <div className="text-center">
                                                <FontAwesomeIcon icon={faHashtag} className="h-3 w-3 mr-1" />
                                                {t`Qty`}
                                            </div>
                                            <div className="text-right">
                                                <FontAwesomeIcon icon={faScaleBalanced} className="h-3 w-3 mr-1" />
                                                {t`Unit Price`}
                                            </div>
                                            <div className="text-right">
                                                <FontAwesomeIcon icon={faDollarSign} className="h-3 w-3 mr-1" />
                                                {t`Total Price`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-outline-variant">
                                        {topExpensesData.map((item, index) => (
                                            <div
                                                key={item.id}
                                                className="grid grid-cols-7 gap-4 p-4 hover:bg-surface-variant/50 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setIsComparisonOpen(true);
                                                    trackEvent('open_price_comparison_modal');
                                                }}
                                            >
                                                <div className="font-mono text-sm text-on-surface-variant">
                                                    {item.barcode || "--"}
                                                </div>
                                                <div className="font-medium text-on-surface truncate" title={item.name}>
                                                    {item.name || "--"}
                                                </div>
                                                <div className="text-on-surface-variant truncate" title={item.brand}>
                                                    {item.brand || "--"}
                                                </div>
                                                <div>
                                                    <Chip
                                                        variant="assist"
                                                        size="small"
                                                        className={cn(getCategoryClass(item.category))}
                                                    >
                                                        {item.category ? (chartConfig[getCategoryKey(item.category)]?.label || item.category) : "--"}
                                                    </Chip>
                                                </div>
                                                <div className="text-center font-medium text-on-surface">
                                                    {i18n.number(item.quantity, { maximumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-right font-medium text-on-surface">
                                                    {i18n.number(
                                                        item.price,
                                                        {
                                                            style: 'currency',
                                                            currencySign: 'accounting',
                                                            currency: getCurrencyFromLocale(i18n.locale),
                                                        }
                                                    )}
                                                </div>
                                                <div className="text-right font-bold text-primary">
                                                    {i18n.number(
                                                        item.totalPrice,
                                                        {
                                                            style: 'currency',
                                                            currencySign: 'accounting',
                                                            currency: getCurrencyFromLocale(i18n.locale),
                                                        }
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <EmptyState
                                    title={t`No Expenses This Month`}
                                    description={t`Add a new purchase to see your top expenses here.`}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                <PriceComparisonModal
                    open={isComparisonOpen}
                    onOpenChange={(open) => { if (!open) setSelectedItem(null); setIsComparisonOpen(open); }}
                    item={selectedItem}
                    allItems={allItemsState}
                    locale={i18n.locale}
                />
            </div>
        </SideBarLayout>
    );
}
