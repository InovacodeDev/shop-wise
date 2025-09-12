import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/md3/card";
import { Input } from "@/components/md3/input";
import { Button } from "@/components/md3/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLingui, Plural } from '@lingui/react/macro';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/md3/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHistory,
    faSearch,
    faStore,
    faShoppingCart,
    faDollarSign,
    faBox,
    faReceipt,
    faHashtag,
    faBarcode,
    faWeightHanging,
    faTrash,
    faPlusCircle,
    faSave,
    faPencil,
    faCheck,
    faTags,
    faPercent,
    faCoins,
} from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/hooks/use-toast";
import { PurchaseItem, updatePurchaseItems } from "../../routes/family/actions";
import { trackEvent } from "@/services/analytics-service";
import { apiService } from "@/services/api";
import { enqueueGetPurchaseItems } from '@/lib/api-queue';
import { MonthlyPurchaseDisplay } from "@/components/purchases/monthly-purchase-display";
import type { MonthlyPurchaseGroup, Purchase as ApiPurchase } from "@/types/api";
import { getCurrencyFromLocale } from "@/lib/localeCurrency";
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/md3';
import { materialSpacing, materialShapes, materialElevation, materialTypography } from "@/lib/material-design";

// Simple Levenshtein distance - used for fuzzy name matching
function levenshtein(a: string, b: string) {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        }
    }
    return dp[m][n];
}

function nameSimilarity(a?: string, b?: string) {
    if (!a || !b) return 0;
    const aa = a.trim().toLowerCase();
    const bb = b.trim().toLowerCase();
    if (aa === bb) return 1;
    const dist = levenshtein(aa, bb);
    const maxLen = Math.max(aa.length, bb.length) || 1;
    return 1 - dist / maxLen;
}

// Use a global enqueue helper to serialize and rate-limit requests to avoid 429

interface Purchase {
    id: string;
    storeName: string;
    date: Date;
    totalAmount: number;
    items: PurchaseItem[];
}

export function HistoryTab() {
    const { t, i18n } = useLingui();
    const { profile } = useAuth();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
    const [loadingSelectedItems, setLoadingSelectedItems] = useState(false);
    const [monthlyGroups, setMonthlyGroups] = useState<MonthlyPurchaseGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [useMonthlyView, setUseMonthlyView] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStore, setSelectedStore] = useState("all");
    const [selectedPeriod, setSelectedPeriod] = useState("all");

    useEffect(() => {
        async function fetchPurchases() {
            if (!profile?.familyId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Try to fetch monthly grouped purchases first
                try {
                    const monthlyData = await apiService.getPurchasesByMonth(profile.familyId);
                    setMonthlyGroups(monthlyData);

                    // Convert monthly data to flat purchases for filtering compatibility
                    const flatPurchases: Purchase[] = [];
                    for (const group of monthlyData) {
                        for (const purchase of group.purchases) {
                            const items = await enqueueGetPurchaseItems(profile.familyId!, purchase._id);
                            const purchaseItems = (items as any[]).map((item: any) => ({
                                id: item.id,
                                productId: item.productId,
                                name: item.productName || item.name,
                                barcode: item.productBarcode || item.barcode,
                                volume: item.productVolume || item.volume,
                                quantity: item.quantity,
                                price: item.totalPrice || item.price,
                                unitPrice: item.unitPrice || item.price,
                                productRef: { id: item.productId }
                            })) as PurchaseItem[];

                            flatPurchases.push({
                                id: purchase._id,
                                storeName: purchase.storeName,
                                date: new Date(purchase.date),
                                totalAmount: purchase.totalAmount,
                                items: purchaseItems,
                            });
                        }
                    }
                    setPurchases(flatPurchases);
                    setUseMonthlyView(true);
                } catch (monthlyError) {
                    console.warn("Monthly purchase view failed, falling back to flat list:", monthlyError);

                    // Fallback to flat purchase list
                    const purchases = await apiService.getPurchases(profile.familyId);
                    const allPurchases = await Promise.all(
                        purchases.map(async (purchase: any) => {
                            const items = await enqueueGetPurchaseItems(profile.familyId!, purchase.id);

                            const purchaseItems = (items as any[]).map((item: any) => ({
                                id: item.id,
                                productId: item.productId,
                                name: item.productName || item.name,
                                barcode: item.productBarcode || item.barcode,
                                volume: item.productVolume || item.volume,
                                quantity: item.quantity,
                                price: item.totalPrice || item.price,
                                unitPrice: item.unitPrice || item.price,
                                productRef: { id: item.productId }
                            })) as PurchaseItem[];

                            return {
                                id: purchase.id,
                                storeName: purchase.storeName,
                                date: new Date(purchase.date),
                                totalAmount: purchase.totalAmount,
                                items: purchaseItems,
                            } as unknown as Purchase;
                        })
                    );

                    // Sort by date descending
                    allPurchases.sort((a, b) => b.date.getTime() - a.date.getTime());
                    setPurchases(allPurchases);
                    setUseMonthlyView(false);
                }
            } catch (error) {
                console.error("Error fetching purchase history: ", error);
                setUseMonthlyView(false);
            } finally {
                setLoading(false);
            }
        }

        fetchPurchases();
    }, [profile]);

    const handleDeletePurchase = async (purchaseId: string) => {
        if (!profile?.familyId) {
            toast({
                variant: "destructive",
                title: t`Error`,
                description: t`You need to be logged in to perform this action.`,
            });
            return;
        }

        try {
            // Delete purchase via API (backend will handle deleting items)
            await apiService.deletePurchase(profile.familyId, purchaseId);

            setPurchases((prev) => prev.filter((p) => p.id !== purchaseId));

            toast({
                title: t`Success!`,
                description: t`Purchase deleted successfully.`,
            });
            trackEvent("purchase_deleted", { purchaseId });
        } catch (error) {
            console.error("Error deleting purchase:", error);
            toast({
                variant: "destructive",
                title: t`Error`,
                description: t`An error occurred while deleting the purchase. Please try again.`,
            });
        }
    };

    const filteredPurchases = useMemo(
        () =>
            purchases.filter((purchase) => {
                const lowerSearchTerm = searchTerm.toLowerCase();
                const matchesSearch =
                    lowerSearchTerm === "" ||
                    purchase.storeName.toLowerCase().includes(lowerSearchTerm) ||
                    purchase.items.some((item) => item.name?.toLowerCase().includes(lowerSearchTerm));

                const matchesStore = selectedStore === "all" || purchase.storeName === selectedStore;

                const now = new Date();
                const purchaseDate = purchase.date;

                const matchesPeriod =
                    selectedPeriod === "all" ||
                    (selectedPeriod === "last_month" &&
                        purchaseDate > new Date(new Date().setMonth(now.getMonth() - 1))) ||
                    (selectedPeriod === "last_3_months" &&
                        purchaseDate > new Date(new Date().setMonth(now.getMonth() - 3))) ||
                    (selectedPeriod === "last_6_months" &&
                        purchaseDate > new Date(new Date().setMonth(now.getMonth() - 6))) ||
                    (selectedPeriod === "last_year" &&
                        purchaseDate > new Date(new Date().setFullYear(now.getFullYear() - 1)));

                return matchesSearch && matchesStore && matchesPeriod;
            }),
        [purchases, searchTerm, selectedStore, selectedPeriod]
    );

    const availableStores = useMemo(() => {
        const storeSet = new Set(purchases.map((p) => p.storeName));
        return Array.from(storeSet);
    }, [purchases]);

    // If we have monthly data and no filters are applied, use the monthly view
    const shouldUseMonthlyView = useMonthlyView &&
        searchTerm === "" &&
        selectedStore === "all" &&
        selectedPeriod === "all";

    return (
        <div
            className="flex flex-col"
            style={{ gap: materialSpacing['2xl'] }} // 48px gap using Material Design 3
        >
            {loadingSelectedItems && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div
                        className="bg-surface-container text-on-surface p-8 flex flex-col items-center gap-6 transition-all duration-200 min-w-80"
                        style={{
                            borderRadius: materialShapes.components.dialog,
                            boxShadow: materialElevation.level3.shadow,
                        }}
                    >
                        <div className="relative">
                            <svg className="animate-spin h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                <path className="opacity-75" fill="currentColor" d="m15.84 10.24-1.41-1.41L12 11.26 9.57 8.83 8.16 10.24 12 14.08l3.84-3.84z"></path>
                            </svg>
                            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
                        </div>
                        <div className="text-center">
                            <div
                                className="font-medium text-on-surface mb-2"
                                style={{
                                    fontSize: materialTypography.titleMedium.fontSize,
                                    fontWeight: materialTypography.titleMedium.fontWeight,
                                }}
                            >{t`Loading purchase...`}</div>
                            <div
                                className="text-on-surface-variant"
                                style={{
                                    fontSize: materialTypography.bodyMedium.fontSize,
                                    fontWeight: materialTypography.bodyMedium.fontWeight,
                                }}
                            >{t`Your request is queued to avoid API rate limits.`}</div>
                        </div>
                    </div>
                </div>
            )}
            {shouldUseMonthlyView ? (
                // Use the monthly purchase display component
                <MonthlyPurchaseDisplay
                    familyId={profile?.familyId || undefined}
                    onPurchaseSelect={async (purchase) => {
                        if (!profile?.familyId) return;
                        setLoadingSelectedItems(true);
                        try {
                            const familyId = profile.familyId!;
                            const purchaseId = (purchase as any)._id || (purchase as any).id;
                            const items = await enqueueGetPurchaseItems(familyId, purchaseId);
                            const mappedItems: PurchaseItem[] = (items as any[]).map((item: any) => ({
                                id: item.id,
                                productId: item.productId,
                                name: item.productName || item.name,
                                barcode: item.productBarcode || item.barcode,
                                volume: item.productVolume || item.volume,
                                quantity: item.quantity,
                                price: item.totalPrice || item.price,
                                unitPrice: item.unitPrice || item.price,
                                productRef: { id: item.productId }
                            })) as PurchaseItem[];

                            const localPurchase: Purchase = {
                                id: String(purchase._id || purchase.id),
                                storeName: purchase.storeName,
                                date: new Date(purchase.date),
                                totalAmount: purchase.totalAmount,
                                items: mappedItems,
                            };

                            setSelectedPurchase(localPurchase);
                        } catch (err) {
                            console.error('Error loading purchase items', err);
                            toast({ title: t`Error`, description: t`Failed to load purchase items.` });
                        } finally {
                            setLoadingSelectedItems(false);
                        }
                    }}
                />
            ) : (
                // Fallback to traditional card-based view with filters
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline flex items-center gap-2">
                            <FontAwesomeIcon icon={faHistory} className="w-6 h-6" /> {t`Purchase History`}
                        </CardTitle>
                        <CardDescription>
                            {useMonthlyView
                                ? t`Filtered view - clear filters to see monthly organization.`
                                : t`View and filter all your past purchases.`
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-grow">
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                />
                                <Input
                                    placeholder={t`Search by store or product...`}
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={selectedStore} onValueChange={setSelectedStore}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder={t`Filter by store`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t`All stores`}</SelectItem>
                                    {availableStores.map((store) => (
                                        <SelectItem key={store} value={store}>
                                            {store}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder={t`Filter by period`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t`All periods`}</SelectItem>
                                    <SelectItem value="last_month">{t`Last month`}</SelectItem>
                                    <SelectItem value="last_3_months">{t`Last 3 months`}</SelectItem>
                                    <SelectItem value="last_6_months">{t`Last 6 months`}</SelectItem>
                                    <SelectItem value="last_year">{t`Last year`}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {loading ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {[...Array(3)].map((_, i) => (
                                    <Card key={i}>
                                        <CardHeader>
                                            <Skeleton className="h-6 w-3/4" />
                                        </CardHeader>
                                        <CardContent>
                                            <Skeleton className="h-5 w-1/2" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <>
                                {filteredPurchases.length > 0 ? (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {filteredPurchases.map((purchase) => (
                                            <PurchaseCard
                                                key={purchase.id}
                                                purchase={purchase}
                                                onDelete={handleDeletePurchase}
                                                allPurchases={purchases}
                                                globalDisabled={loadingSelectedItems}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title={t`No Purchases Found`}
                                        description={t`Try adjusting your filters or add a new purchase to get started.`}
                                    />
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Selected Purchase Modal */}
            {selectedPurchase && (
                <Dialog open={!!selectedPurchase} onOpenChange={(open) => { if (!open) setSelectedPurchase(null); }}>
                    <DialogContent
                        variant="basic"
                        className="min-[]:500"
                        showCloseButton={false}
                    >
                        <DialogHeader>
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <DialogTitle className="flex items-center gap-3 mb-2">
                                        <span
                                            className="inline-flex items-center justify-center text-primary bg-primary/10"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: materialShapes.corner.medium,
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faReceipt} className="w-5 h-5" />
                                        </span>
                                        <span className="leading-tight">{t`Purchase Details`}</span>
                                    </DialogTitle>
                                    <DialogDescription className="text-on-surface-variant">
                                        {selectedPurchase.storeName} • {new Date(selectedPurchase.date).toLocaleString()}
                                    </DialogDescription>
                                </div>
                                <div className="text-right">
                                    <div
                                        className="text-on-surface-variant mb-1"
                                        style={{
                                            fontSize: materialTypography.labelMedium.fontSize,
                                            fontWeight: materialTypography.labelMedium.fontWeight,
                                        }}
                                    >{t`Total`}</div>
                                    <div
                                        className="text-on-surface font-semibold"
                                        style={{
                                            fontSize: materialTypography.headlineSmall.fontSize,
                                            fontWeight: materialTypography.headlineSmall.fontWeight,
                                        }}
                                    >
                                        {i18n.number(
                                            selectedPurchase.totalAmount || selectedPurchase.items.reduce((s, it) => s + (it.price || 0), 0),
                                            { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) }
                                        )}
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>

                        <div
                            className="overflow-hidden"
                            style={{
                                borderRadius: materialShapes.corner.medium,
                                backgroundColor: 'hsl(var(--surface-container-lowest))',
                                boxShadow: materialElevation.level1.shadow,
                            }}
                        >
                            <div className="max-h-[60vh] overflow-y-auto">
                                <Table className="min-w-full">
                                    <TableHeader>
                                        <TableRow className="border-b border-outline-variant bg-surface-container-high/30">
                                            <TableHead 
                                                className="font-semibold text-on-surface"
                                                style={{ 
                                                    padding: `${materialSpacing.md} ${materialSpacing.lg}`,
                                                    fontSize: materialTypography.titleSmall.fontSize,
                                                    fontWeight: materialTypography.titleSmall.fontWeight,
                                                }}
                                            >
                                                {t`Product`}
                                            </TableHead>
                                            <TableHead 
                                                className="w-[120px] text-center font-semibold text-on-surface"
                                                style={{
                                                    fontSize: materialTypography.titleSmall.fontSize,
                                                    fontWeight: materialTypography.titleSmall.fontWeight,
                                                }}
                                            >
                                                {t`Qty`}
                                            </TableHead>
                                            <TableHead 
                                                className="w-[140px] text-right font-semibold text-on-surface"
                                                style={{
                                                    fontSize: materialTypography.titleSmall.fontSize,
                                                    fontWeight: materialTypography.titleSmall.fontWeight,
                                                }}
                                            >
                                                {t`Unit Price`}
                                            </TableHead>
                                            <TableHead 
                                                className="w-[140px] text-right font-semibold text-on-surface"
                                                style={{
                                                    padding: `${materialSpacing.md} ${materialSpacing.lg}`,
                                                    fontSize: materialTypography.titleSmall.fontSize,
                                                    fontWeight: materialTypography.titleSmall.fontWeight,
                                                }}
                                            >
                                                {t`Total Price`}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedPurchase.items.map((item, index) => {
                                            const unitPrice = item.unitPrice !== undefined && item.unitPrice > 0 ? item.unitPrice : (item.quantity ? (item.price || 0) / item.quantity : 0);
                                            const isEven = index % 2 === 0;
                                            return (
                                                <TableRow 
                                                    key={item.id} 
                                                    className={`
                                                        border-b border-outline-variant/40 transition-colors duration-200
                                                        hover:bg-surface-container-high/50 cursor-pointer
                                                        ${isEven ? 'bg-surface-container-lowest' : 'bg-surface-container-low/30'}
                                                    `}
                                                >
                                                    <TableCell 
                                                        style={{ padding: `${materialSpacing.md} ${materialSpacing.lg}` }}
                                                        className="max-w-0"
                                                    >
                                                        <div className="flex flex-col gap-1">
                                                            <div
                                                                className="font-medium text-on-surface truncate"
                                                                style={{
                                                                    fontSize: materialTypography.bodyLarge.fontSize,
                                                                    fontWeight: materialTypography.bodyLarge.fontWeight,
                                                                }}
                                                                title={item.name}
                                                            >
                                                                {item.name}
                                                            </div>
                                                            {item.volume && (
                                                                <div
                                                                    className="text-on-surface-variant flex items-center gap-1"
                                                                    style={{
                                                                        fontSize: materialTypography.bodySmall.fontSize,
                                                                        fontWeight: materialTypography.bodySmall.fontWeight,
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon icon={faBox} className="w-3 h-3 opacity-60" />
                                                                    <span>{item.volume}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell 
                                                        className="text-center"
                                                        style={{
                                                            fontSize: materialTypography.bodyMedium.fontSize,
                                                            fontWeight: materialTypography.bodyMedium.fontWeight,
                                                        }}
                                                    >
                                                        <span className="inline-flex items-center justify-center min-w-8 h-6 px-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                                            {item.quantity}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell 
                                                        className="text-right text-on-surface"
                                                        style={{
                                                            fontSize: materialTypography.bodyMedium.fontSize,
                                                            fontWeight: materialTypography.bodyMedium.fontWeight,
                                                        }}
                                                    >
                                                        {i18n.number(unitPrice, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}
                                                    </TableCell>
                                                    <TableCell 
                                                        className="text-right font-semibold text-on-surface"
                                                        style={{ 
                                                            padding: `${materialSpacing.md} ${materialSpacing.lg}`,
                                                            fontSize: materialTypography.bodyLarge.fontSize,
                                                            fontWeight: '600',
                                                        }}
                                                    >
                                                        {i18n.number(item.price || (unitPrice * item.quantity), { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                                
                                {/* Total Summary Footer */}
                                <div 
                                    className="border-t border-outline-variant bg-surface-container-high/50 p-4"
                                    style={{ padding: materialSpacing.lg }}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faReceipt} className="w-4 h-4 text-on-surface-variant" />
                                            <span 
                                                className="text-on-surface-variant"
                                                style={{
                                                    fontSize: materialTypography.bodyMedium.fontSize,
                                                    fontWeight: materialTypography.bodyMedium.fontWeight,
                                                }}
                                            >
                                                <Plural value={selectedPurchase.items.length} one="# item" other="# items" />
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span 
                                                className="text-on-surface-variant"
                                                style={{
                                                    fontSize: materialTypography.bodyMedium.fontSize,
                                                    fontWeight: materialTypography.bodyMedium.fontWeight,
                                                }}
                                            >
                                                {t`Total:`}
                                            </span>
                                            <span 
                                                className="text-primary font-bold text-xl"
                                                style={{
                                                    fontSize: materialTypography.titleMedium.fontSize,
                                                    fontWeight: '700',
                                                }}
                                            >
                                                {i18n.number(selectedPurchase.totalAmount, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

function PurchaseCard({ purchase, onDelete, allPurchases, globalDisabled }: { purchase: Purchase; onDelete: (id: string) => void; allPurchases?: Purchase[]; globalDisabled?: boolean }) {
    const { i18n, t } = useLingui();
    const { profile } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [items, setItems] = useState<PurchaseItem[]>(purchase.items);
    const [isSaving, setIsSaving] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    // globalDisabled is received from props to temporarily disable interactions while background requests are queued

    const originalItemsJson = useMemo(() => JSON.stringify(purchase.items), [purchase.items]);
    const isDirty = useMemo(() => JSON.stringify(items) !== originalItemsJson, [items, originalItemsJson]);

    useEffect(() => {
        if (isDialogOpen) {
            setItems(purchase.items);
        } else {
            setEditingItemId(null);
        }
    }, [isDialogOpen, purchase.items]);

    const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        if ((field === "quantity" || field === "unitPrice") && item.unitPrice !== undefined) {
            item.price = item.quantity * item.unitPrice;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const handleAddItem = () => {
        const newItemId = `new-${Date.now()}`;
        const newItem: PurchaseItem = {
            id: newItemId,
            productId: '',
            name: "",
            quantity: 1,
            price: 0,
            unitPrice: 0,
            volume: "un",
        };
        setItems([...items, newItem]);
        setEditingItemId(newItemId); // Immediately enter edit mode for the new item
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSaveChanges = async () => {
        if (!profile?.familyId) return;
        setIsSaving(true);
        try {
            await updatePurchaseItems(profile.familyId, purchase.id, items);
            toast({
                title: t`Success!`,
                description: t`Purchase updated successfully.`,
            });
            trackEvent("purchase_items_updated", {
                purchaseId: purchase.id,
                itemCount: items.length,
            });
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error updating purchase:", error);
            toast({
                variant: "destructive",
                title: t`Error`,
                description: t`An error occurred while updating the purchase. Please try again.`,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const totalAmount = useMemo(() => {
        return items.reduce((acc, item) => acc + (item.price || 0), 0);
    }, [items]);

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="text-lg truncate flex items-center gap-2">
                            <FontAwesomeIcon icon={faStore} className="w-4 h-4 text-primary" /> {purchase.storeName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />{" "}
                            {purchase.date
                                .toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <FontAwesomeIcon icon={faShoppingCart} className="w-4 h-4" />
                            <Plural value={purchase.items.length} one="# item" other="# items" />
                        </div>
                        <div className="flex items-center gap-2 font-bold text-lg text-foreground">
                            <FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 text-primary" />
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
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent variant="basic" className="max-w-7xl w-full" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>{t`Purchase Details: ${purchase.storeName}`}</DialogTitle>
                    <DialogDescription className="space-y-2">
                        <div>
                            {purchase.date.toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" })}
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2 font-bold">
                                <FontAwesomeIcon icon={faReceipt} className="w-4 h-4 text-primary" />
                                <span>
                                    {`Total da Nota: ${i18n.number(
                                        totalAmount,
                                        {
                                            style: 'currency',
                                            currencySign: 'accounting',
                                            currency: getCurrencyFromLocale(i18n.locale),
                                        }
                                    )}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faPercent} className="w-4 h-4 text-orange-500" />
                                <span>
                                    {`Desconto: ${i18n.number(
                                        (purchase as any).discount || 0,
                                        {
                                            style: 'currency',
                                            currencySign: 'accounting',
                                            currency: getCurrencyFromLocale(i18n.locale),
                                        }
                                    )}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 font-semibold text-green-600">
                                <FontAwesomeIcon icon={faCoins} className="w-4 h-4" />
                                <span>
                                    {`Total Pago: ${i18n.number(
                                        totalAmount - ((purchase as any).discount || 0),
                                        {
                                            style: 'currency',
                                            currencySign: 'accounting',
                                            currency: getCurrencyFromLocale(i18n.locale),
                                        }
                                    )}`}
                                </span>
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[65vh] overflow-y-auto pr-2">
                    <div className="min-w-full overflow-hidden">
                        <Table className="table-fixed w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">
                                        <FontAwesomeIcon icon={faBox} className="inline-block mr-1 w-4 h-4" />{" "}
                                        {t`Product`}
                                    </TableHead>
                                    <TableHead className="w-[120px]">
                                        <FontAwesomeIcon icon={faTags} className="inline-block mr-1 w-4 h-4" />{" "}
                                        {t`Category`}
                                    </TableHead>
                                    <TableHead className="w-[120px]">
                                        <FontAwesomeIcon icon={faWeightHanging} className="inline-block mr-1 w-4 h-4" />{" "}
                                        {t`Volume`}
                                    </TableHead>
                                    <TableHead className="text-center w-[100px]">
                                        <FontAwesomeIcon icon={faHashtag} className="inline-block mr-1 w-4 h-4" />{" "}
                                        {t`Qty`}
                                    </TableHead>
                                    <TableHead className="text-center w-[120px]">{t`Unit Price`}</TableHead>
                                    <TableHead className="text-right w-[120px]">{t`Total Price`}</TableHead>
                                    <TableHead className="text-right w-[120px]">{t`Change`}</TableHead>
                                    <TableHead className="w-[100px] text-right">{t`Actions`}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="relative">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="relative min-h-[2.5rem]">
                                                        {editingItemId === item.id ? (
                                                            <Input
                                                                value={item.name}
                                                                onChange={(e) => handleItemChange(index, "name", e.target.value)}
                                                                placeholder={t`Item name`}
                                                                className="text-sm"
                                                            />
                                                        ) : (
                                                            <div
                                                                className="p-2 text-sm cursor-pointer hover:bg-muted/50 rounded"
                                                                style={{
                                                                    display: '-webkit-box',
                                                                    WebkitBoxOrient: 'vertical',
                                                                    WebkitLineClamp: 2,
                                                                    overflow: 'hidden',
                                                                    lineHeight: '1.2',
                                                                    maxHeight: '2.4em'
                                                                }}
                                                            >
                                                                {item.name || t`Item name`}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" align="start" className="max-w-sm">
                                                    <p className="break-words text-sm">{item.name}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={(item as any).category || ''}
                                                onChange={(e) => handleItemChange(index, "category", e.target.value)}
                                                placeholder={t`Category`}
                                                disabled={editingItemId !== item.id}
                                                className="text-sm"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={item.volume || ''}
                                                onChange={(e) => handleItemChange(index, "volume", e.target.value)}
                                                placeholder={t`ex: 1kg, 500ml`}
                                                disabled={editingItemId !== item.id}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)
                                                }
                                                className="text-center"
                                                disabled={editingItemId !== item.id}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) =>
                                                    handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)
                                                }
                                                className="text-center"
                                                disabled={editingItemId !== item.id}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {i18n.number(
                                                item.price,
                                                {
                                                    style: 'currency',
                                                    currencySign: 'accounting',
                                                    currency: getCurrencyFromLocale(i18n.locale),
                                                }
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {(() => {
                                                const purchasesList = allPurchases || [];
                                                // Flatten matching items with context
                                                const matches: Array<{ price: number; date: Date; store: string; name?: string }> = [];

                                                for (const p of purchasesList) {
                                                    for (const it of p.items) {
                                                        let matched = false;
                                                        // 1) match by productRef.id if available
                                                        // @ts-ignore - some items may not have productRef typed
                                                        if ((it as any).productRef?.id && (item as any).productRef?.id) {
                                                            if ((it as any).productRef.id === (item as any).productRef.id) matched = true;
                                                        }

                                                        // 2) exact barcode
                                                        if (!matched && item.barcode && it.barcode) {
                                                            matched = it.barcode === item.barcode;
                                                        }

                                                        // 3) fuzzy name match using Levenshtein similarity (threshold 0.75)
                                                        if (!matched && item.name && it.name) {
                                                            const sim = nameSimilarity(item.name, it.name);
                                                            if (sim >= 0.75) matched = true;
                                                        }

                                                        if (matched) {
                                                            matches.push({ price: it.price, date: p.date as unknown as Date, store: p.storeName, name: it.name });
                                                        }
                                                    }
                                                }

                                                if (matches.length === 0) return <span className="text-muted-foreground">{t`No history`}</span>;

                                                // Sort matches descending by date
                                                matches.sort((a, b) => b.date.getTime() - a.date.getTime());

                                                // previous is the most recent before this purchase date
                                                const prev = matches.find(m => m.date.getTime() < purchase.date.getTime()) || null;
                                                if (!prev) return <span className="text-muted-foreground">{t`No previous`}</span>;

                                                const diff = item.price - prev.price;
                                                const pct = prev.price > 0 ? (diff / prev.price) : 0;
                                                const cls = diff > 0 ? 'text-destructive' : (diff < 0 ? 'text-green-600' : 'text-muted-foreground');

                                                const last3 = matches.slice(0, 3);
                                                const tooltipContent = (
                                                    <div className="space-y-1 text-sm">
                                                        {last3.map((m, i) => (
                                                            <div key={i} className="flex justify-between">
                                                                <div className="truncate">{m.name || m.store}</div>
                                                                <div className="text-right">
                                                                    <div>{i18n.number(m.price, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}</div>
                                                                    <div className="text-xs text-muted-foreground">{m.date.toLocaleDateString()}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );

                                                return (
                                                    <Tooltip>
                                                        <div className={`text-sm ${cls}`}>
                                                            <TooltipTrigger asChild>
                                                                <div className="cursor-help">
                                                                    <div>{i18n.number(diff, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) })}</div>
                                                                    <div className="text-xs text-muted-foreground">{i18n.number(pct, { style: 'percent', maximumFractionDigits: 1 })} • {prev.date.toLocaleDateString()}</div>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" align="center">
                                                                {tooltipContent}
                                                            </TooltipContent>
                                                        </div>
                                                    </Tooltip>
                                                );
                                            })()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1">
                                                {editingItemId === item.id ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingItemId(null)}
                                                    >
                                                        <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-primary" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingItemId(item.id)}
                                                    >
                                                        <FontAwesomeIcon icon={faPencil} className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveItem(index)}
                                                    disabled={editingItemId === item.id}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <Button variant="outlined" className="mt-4" onClick={handleAddItem} disabled={!!editingItemId}>
                        <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                        {t`Add Item`}
                    </Button>
                </div>
                <DialogFooter className="pt-4 border-t flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive-outlined">
                                    <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
                                    {t`Delete Purchase`}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t`Delete Purchase?`}</AlertDialogTitle>
                                    <AlertDialogDescription>{t`This will permanently delete the purchase and its items. This action can't be undone.`}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => {
                                            onDelete(purchase.id);
                                            setIsDialogOpen(false);
                                        }}
                                    >
                                        {t`Yes, delete`}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:gap-4">
                        <Button onClick={handleSaveChanges} disabled={isSaving || !isDirty || !!editingItemId}>
                            <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                            {isSaving ? t`Saving...` : t`Save Changes`}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
