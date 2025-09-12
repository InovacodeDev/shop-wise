import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/md3/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLingui } from '@lingui/react/macro';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, PieChart as RechartsPieChart, Cell, ResponsiveContainer } from "recharts";
import { ReactNode } from "react";
import { EmptyState } from "../ui/empty-state";
import {
    faStore,
    faBox,
    faCalendar,
    faTags,
    faDollarSign,
    faWandMagicSparkles,
    faGem,
    faRocket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge } from "@/components/md3/badge";
import { Chip } from "@/components/md3/chip";
import { Skeleton } from "../ui/skeleton";
import { Button } from "@/components/md3/button";
import { Alert, AlertTitle } from "../ui/alert";
import ReactMarkdown from "react-markdown";
import { Link } from "@tanstack/react-router";
import { getCurrencyFromLocale } from "@/lib/localeCurrency";
import { cn } from "@/lib/utils";

interface InsightModalProps {
    title: string;
    description: string;
    children: ReactNode;
    data: any[];
    chartData?: any[];
    chartConfig?: any;
    type: "spendingByStore" | "recentItems" | "topCategories" | "savingsOpportunities" | "consumptionAnalysis" | "goalsSummary";
    analysis?: string | null;
    isLoading?: boolean;
    onOpen?: () => void;
    isPremium?: boolean;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF19AF", "#19AFFF", "#AFFF19"];

const categoryMapping: { [key: string]: string } = {
    "Produce and Eggs": "produce_and_eggs",
    "Meat and Seafood": "meat_and_seafood",
    "Bakery and Deli": "bakery_and_deli",
    "Dairy and Chilled": "dairy_and_chilled",
    'Pantry and Dry Goods': "pantry_and_dry_goods",
    "Breakfast and Snacks": "breakfast_and_snacks",
    "Frozen foods": "frozen_foods",
    "Beverages": "beverages",
    "Cleaning and household": "cleaning_and_household",
    "Personal care": "personal_care",
    "Baby and Child Care": "baby_and_child_care",
    "Pet supplies": "pet_supplies",
    "Home and General": "home_and_general",
    "Pharmacy": "pharmacy",
    "Others": "others",
};

const getCategoryKey = (categoryName: string | undefined) => {
    if (!categoryName) return "others";
    return categoryMapping[categoryName] || "others";
};

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

export function InsightModal({
    title,
    description,
    children,
    data,
    chartData,
    chartConfig,
    type,
    analysis,
    isLoading,
    onOpen,
    isPremium,
}: InsightModalProps) {
    const { i18n, t } = useLingui();

    const renderContent = () => {
        if (type !== "consumptionAnalysis" && (!data || data.length === 0)) {
            return (
                <EmptyState
                    title={t`No Data to Display`}
                    description={t`There is no data available for the selected insight. Start adding purchases to see your data here.`}
                />
            );
        }

        switch (type) {
            case "spendingByStore":
                const total = data.reduce((acc, item) => acc + item.value, 0);
                const pieData = data.map((item) => ({ ...item, percentage: ((item.value / total) * 100).toFixed(0) }));

                return (
                    <div className="rounded-lg border border-outline-variant bg-surface overflow-hidden">
                        <div className="p-4 border-b border-outline-variant bg-surface-variant/30">
                            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-on-surface-variant min-w-0">
                                <div className="flex items-center gap-2 truncate">
                                    <FontAwesomeIcon icon={faStore} className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{t`Store`}</span>
                                </div>
                                <div className="flex items-center gap-2 text-right truncate">
                                    <FontAwesomeIcon icon={faDollarSign} className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{t`This Month`}</span>
                                </div>
                                <div className="text-right truncate">
                                    {t`Avg/Month`}
                                </div>
                                <div className="text-center truncate">
                                    {t`Months Active`}
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-outline-variant">
                            {data.map((item, index) => (
                                <div key={index} className="grid grid-cols-4 gap-4 p-4 hover:bg-surface-variant/50 transition-colors min-w-0">
                                    <div className="font-medium text-on-surface truncate min-w-0" title={item.name}>
                                        {item.name}
                                    </div>
                                    <div className="text-right font-medium text-primary truncate">
                                        {i18n.number(
                                            item.value,
                                            {
                                                style: 'currency',
                                                currencySign: 'accounting',
                                                currency: getCurrencyFromLocale(i18n.locale),
                                            }
                                        )}
                                    </div>
                                    <div className="text-right text-on-surface-variant truncate">
                                        {i18n.number(
                                            item.historicalAverage || item.value,
                                            {
                                                style: 'currency',
                                                currencySign: 'accounting',
                                                currency: getCurrencyFromLocale(i18n.locale),
                                            }
                                        )}
                                    </div>
                                    <div className="text-center flex justify-center">
                                        <Chip variant="assist" size="small" className="bg-secondary text-on-secondary">
                                            {item.monthsActive || 1}
                                        </Chip>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "recentItems":
                return (
                    <div className="rounded-lg border border-outline-variant bg-surface overflow-hidden">
                        <div className="p-4 border-b border-outline-variant bg-surface-variant/30">
                            <div className="grid grid-cols-3 gap-4 text-sm font-medium text-on-surface-variant min-w-0">
                                <div className="flex items-center gap-2 truncate">
                                    <FontAwesomeIcon icon={faBox} className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{t`Product`}</span>
                                </div>
                                <div className="flex items-center gap-2 truncate">
                                    <FontAwesomeIcon icon={faCalendar} className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{t`Purchase Date`}</span>
                                </div>
                                <div className="flex items-center gap-2 justify-end truncate">
                                    <FontAwesomeIcon icon={faDollarSign} className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{t`Price`}</span>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-outline-variant">
                            {data.map((item, index) => (
                                <div key={index} className="grid grid-cols-3 gap-4 p-4 hover:bg-surface-variant/50 transition-colors min-w-0">
                                    <div className="font-medium text-on-surface truncate min-w-0" title={item.name}>
                                        {item.name}
                                    </div>
                                    <div className="text-on-surface-variant truncate">
                                        {i18n.date(item.purchaseDate, {
                                            month: '2-digit',
                                            day: '2-digit',
                                            year: 'numeric',
                                        })}
                                    </div>
                                    <div className="text-right font-medium text-primary truncate">
                                        {i18n.number(
                                            item.price,
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
                );
            case "topCategories":
                return (
                    <div className="grid md:grid-cols-2 gap-6 items-start min-w-0">
                        <div className="rounded-lg border border-outline-variant bg-surface overflow-hidden">
                            <div className="p-4 border-b border-outline-variant bg-surface-variant/30">
                                <div className="grid grid-cols-2 gap-4 text-sm font-medium text-on-surface-variant min-w-0">
                                    <div className="flex items-center gap-2 truncate">
                                        <FontAwesomeIcon icon={faTags} className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{t`Category`}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-right justify-end truncate">
                                        <FontAwesomeIcon icon={faDollarSign} className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{t`Amount Spent`}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="divide-y divide-outline-variant">
                                {data.map((item, index) => (
                                    <div key={index} className="grid grid-cols-2 gap-4 p-4 hover:bg-surface-variant/50 transition-colors min-w-0">
                                        <div className="min-w-0">
                                            <Chip
                                                variant="assist"
                                                size="small"
                                                className={cn(getCategoryClass(item.name), "truncate max-w-full")}
                                            >
                                                <span className="truncate">{item.name}</span>
                                            </Chip>
                                        </div>
                                        <div className="text-right font-medium text-primary truncate">
                                            {i18n.number(
                                                item.value,
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
                        {chartData && chartData.length > 0 && (
                            <div className="flex items-center justify-center h-64 min-w-0 overflow-hidden">
                                <ChartContainer config={chartConfig} className="h-full w-full min-w-0">
                                    <ResponsiveContainer>
                                        <RechartsPieChart>
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent hideLabel nameKey="category" />}
                                            />
                                            <Pie data={chartData} dataKey="value" nameKey="category" innerRadius={50}>
                                                {chartData.map((entry) => (
                                                    <Cell key={`cell-${entry.category}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <ChartLegend content={<ChartLegendContent nameKey="category" />} />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                        )}
                    </div>
                );
            case "savingsOpportunities":
                return (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <FontAwesomeIcon icon={faBox} className="mr-2 h-4 w-4" />
                                    {t`Product`}
                                </TableHead>
                                <TableHead>{t`Cheapest at`}</TableHead>
                                <TableHead className="text-right">{t`Potential Savings`}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.store}</TableCell>
                                    <TableCell className="text-right text-primary font-bold">
                                        R$ {item.saving.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );
            case "goalsSummary":
                return (
                    <div className="rounded-lg border border-outline-variant bg-surface overflow-hidden">
                        <div className="p-4 border-b border-outline-variant bg-surface-variant/30">
                            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-on-surface-variant min-w-0">
                                <div className="truncate">{t`Goal`}</div>
                                <div className="text-right truncate">{t`Target`}</div>
                                <div className="text-right truncate">{t`Current`}</div>
                                <div className="text-right truncate">{t`Progress`}</div>
                            </div>
                        </div>
                        <div className="divide-y divide-outline-variant">
                            {data.map((g: any, idx: number) => (
                                <div key={g._id || idx} className="grid grid-cols-4 gap-4 p-4 hover:bg-surface-variant/50 transition-colors min-w-0">
                                    <div className="font-medium text-on-surface truncate min-w-0" title={g.name}>
                                        {g.name}
                                    </div>
                                    <div className="text-right font-medium text-on-surface truncate">
                                        {i18n.number(g.targetAmount || 0, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}
                                    </div>
                                    <div className="text-right text-on-surface-variant truncate">
                                        {i18n.number(g.currentAmount || 0, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}
                                    </div>
                                    <div className="text-right flex justify-end">
                                        {typeof g.progress === 'number' ? (
                                            <Chip variant="assist" size="small" className={cn(
                                                g.progress >= 100 ? "bg-green-100 text-green-800 border-green-200" :
                                                    g.progress >= 75 ? "bg-blue-100 text-blue-800 border-blue-200" :
                                                        g.progress >= 50 ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                                                            "bg-gray-100 text-gray-800 border-gray-200"
                                            )}>
                                                {g.progress.toFixed(1)}%
                                            </Chip>
                                        ) : (
                                            <span className="text-on-surface-variant">{t`-`}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "consumptionAnalysis":
                if (!isPremium) {
                    return (
                        <Alert className="border-primary/50 text-center">
                            <FontAwesomeIcon icon={faGem} className="h-5 w-5 text-primary" />
                            <AlertTitle className="text-lg font-bold text-primary">
                                {t`Premium Feature`}
                            </AlertTitle>
                            <DialogDescription>{t`Unlock detailed consumption analyses and personalized insights by upgrading to our Premium plan.`}</DialogDescription>
                            <Button asChild className="mt-4">
                                <Link to="/family" search={{ tab: 'plan' }}>
                                    <FontAwesomeIcon icon={faRocket} className="mr-2" />
                                    {t`Upgrade your Plan`}
                                </Link>
                            </Button>
                        </Alert>
                    );
                }
                if (isLoading) {
                    return (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <FontAwesomeIcon icon={faWandMagicSparkles} className="h-5 w-5 animate-pulse" />
                                <p>{t`Our AI is analyzing your data... this may take a moment.`}</p>
                            </div>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    );
                }
                if (analysis) {
                    return (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{analysis}</ReactMarkdown>
                        </div>
                    );
                }

                return (
                    <EmptyState
                        title={t`No Analysis Available`}
                        description={t`We couldn't generate an analysis for this dataset. Try again later or add more purchase data.`}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Dialog onOpenChange={(open) => open && onOpen?.()}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-3xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-xl">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="p-4 max-h-[70vh] overflow-x-hidden overflow-y-auto">
                    <div className="min-w-0">{renderContent()}</div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
