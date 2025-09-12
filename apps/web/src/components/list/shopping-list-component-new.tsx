import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/md3/button";
import { Input } from "@/components/md3/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/md3/card";
import { Chip } from "@/components/md3/chip";
import { LoadingIndicator } from "@/components/md3/loading-indicator";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { suggestMissingItems } from "../../routes/list/actions";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faWandMagicSparkles, faPlus, faShareNodes, faDownload } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/hooks/use-auth";
import { apiService } from "@/services/api";
import { useLingui } from '@lingui/react/macro';
import { trackEvent } from "@/services/analytics-service";
import type { ShoppingList as ApiShoppingList } from "@/types/api";
import { cn } from "@/lib/utils";

interface ListItem {
    id: string;
    name: string;
    checked: boolean;
    quantity: number;
    unit: string;
}

interface ShoppingList {
    id: string;
    name: string;
    status: string;
    createdAt: string;
    createdBy: string;
}

export function ShoppingListComponent() {
    const { t } = useLingui();
    const { profile } = useAuth();
    const [items, setItems] = useState<ListItem[]>([]);
    const [activeListId, setActiveListId] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const [newItemQty, setNewItemQty] = useState("1");
    const [newItemUnit, setNewItemUnit] = useState("UN");
    const [loading, setLoading] = useState(true);
    const [suggestedItems, setSuggestedItems] = useState<string[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const { toast } = useToast();

    const getOrCreateActiveList = useCallback(
        async (familyId: string, userId: string) => {
            try {
                // Get existing active list
                const lists = await apiService.getShoppingLists(familyId);
                const activeList = lists.find((list: ApiShoppingList) => list.status === "active");

                if (activeList) {
                    return activeList.id || activeList._id;
                } else {
                    // Create new active list
                    const newList = await apiService.createShoppingList(familyId, {
                        listName: t`Main Shopping List`,
                        familySize: (profile?.family?.adults || 1) + (profile?.family?.children || 0),
                        preferences: '',
                    });
                    return newList.id || newList._id;
                }
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: t`Error`,
                    description: t`Could not load shopping list`,
                });
                return null;
            }
        },
        [t, toast]
    );

    const loadItems = useCallback(async (familyId: string, listId: string) => {
        try {
            if (listId) {
                const items = await apiService.getShoppingListItems(familyId, listId);
                setItems(items.map(item => ({
                    id: item.id || item._id,
                    name: item.name,
                    checked: item.checked || item.isCompleted || false,
                    quantity: item.quantity,
                    unit: item.unit || ''
                })));
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: t`Error`,
                description: t`Could not load shopping list items`,
            });
        } finally {
            setLoading(false);
        }
    }, [toast, t]);

    useEffect(() => {
        console.log({ profile });
        if (!profile?.familyId || !profile._id) return;

        setLoading(true);
        getOrCreateActiveList(profile.familyId, profile._id).then((listId) => {
            if (listId) {
                setActiveListId(listId);
                loadItems(profile.familyId!, listId);
            }
        });
    }, [profile, getOrCreateActiveList, loadItems]);

    const handleAddItem = async () => {
        if (newItemName.trim() !== "" && Number(newItemQty) > 0 && profile?.familyId && activeListId) {
            try {
                await apiService.createShoppingListItem(profile.familyId, activeListId, {
                    name: newItemName.trim(),
                    checked: false,
                    quantity: Number(newItemQty),
                    unit: newItemUnit,
                });

                // Reload items
                loadItems(profile.familyId, activeListId);

                setNewItemName("");
                setNewItemQty("1");
                setNewItemUnit("UN");
                trackEvent("shopping_list_item_added", {
                    item_name: newItemName.trim(),
                    quantity: Number(newItemQty),
                    unit: newItemUnit,
                });
            } catch (error) {
                console.error("Error adding item:", error);
                toast({
                    variant: "destructive",
                    title: t`Error`,
                    description: t`Could not add item to shopping list`,
                });
            }
        }
    };

    const handleToggleItem = async (item: ListItem) => {
        if (!profile?.familyId || !activeListId) return;

        try {
            await apiService.updateShoppingListItem(profile.familyId, activeListId, item.id, {
                checked: !item.checked
            });

            // Update local state
            setItems(items.map(i => i.id === item.id ? { ...i, checked: !item.checked } : i));
        } catch (error) {
            console.error("Error toggling item:", error);
            toast({
                variant: "destructive",
                title: t`Error`,
                description: t`Could not update item`,
            });
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!profile?.familyId || !activeListId) return;

        try {
            await apiService.deleteShoppingListItem(profile.familyId, activeListId, id);

            // Update local state
            setItems(items.filter(item => item.id !== id));
        } catch (error) {
            console.error("Error deleting item:", error);
            toast({
                variant: "destructive",
                title: t`Error`,
                description: t`Could not delete item`,
            });
        }
    };

    const handleGetSuggestions = async () => {
        if (!profile?.familyId) return;

        setIsLoadingSuggestions(true);
        trackEvent("shopping_list_ai_suggestion_requested");

        try {
            // Try to get purchase history from monthly API first, fallback to flat list
            let purchaseHistory = '';
            try {
                const monthlyGroups = await apiService.getPurchasesByMonth(profile.familyId);
                // Convert monthly groups to flat purchase history for AI
                const allPurchases = monthlyGroups.flatMap(group => group.purchases);
                purchaseHistory = allPurchases.map((purchase: any) =>
                    `${purchase.storeName} - ${new Date(purchase.date).toLocaleDateString()} - R$ ${purchase.totalAmount}`
                ).join('\n');
            } catch (monthlyError) {
                console.warn("Monthly purchase data failed, using flat list for AI suggestions:", monthlyError);
                // Fallback to flat purchase list
                const purchases = await apiService.getPurchases(profile.familyId);
                purchaseHistory = purchases.map((purchase: any) =>
                    `${purchase.storeName} - ${new Date(purchase.date).toLocaleDateString()} - R$ ${purchase.totalAmount}`
                ).join('\n');
            }

            const familySize = (profile.family?.adults || 1) + (profile.family?.children || 1);

            const result = await suggestMissingItems({
                purchaseHistory,
                familySize,
            });

            if (result.error) {
                toast({
                    variant: "destructive",
                    title: t`Error getting suggestions`,
                    description: result.error,
                });
            } else {
                setSuggestedItems(result.suggestedItems);
            }
        } catch (error) {
            console.error("Error getting suggestions:", error);
            toast({
                variant: "destructive",
                title: t`Error`,
                description: t`Could not get AI suggestions`,
            });
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleAddSuggestedItem = async (itemName: string) => {
        if (!profile?.familyId || !activeListId) return;

        try {
            await apiService.createShoppingListItem(profile.familyId, activeListId, {
                name: itemName,
                checked: false,
                quantity: 1,
                unit: "UN",
            });

            loadItems(profile.familyId, activeListId);
            setSuggestedItems(suggestedItems.filter(item => item !== itemName));
            trackEvent("shopping_list_item_added", {
                item_name: itemName,
                source: "ai_suggestion",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: t`Error`,
                description: t`Could not add suggested item`,
            });
        }
    };

    const pendingItems = items.filter((item) => !item.checked);
    const completedItems = items.filter((item) => item.checked);

    if (loading) {
        return (
            <Card>
                <CardContent className="p-8">
                    <div className="flex items-center justify-center">
                        <LoadingIndicator
                            size="lg"
                            showLabel={true}
                            label={t`Loading shopping list...`}
                            labelPosition="bottom"
                        />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{t`Shopping List`}</h2>
                    <Button
                        onClick={handleGetSuggestions}
                        disabled={isLoadingSuggestions}
                        variant="outlined"
                        size="sm"
                        className={cn(isLoadingSuggestions && "pointer-events-none")}
                    >
                        {isLoadingSuggestions ? (
                            <LoadingIndicator size="xs" className="mr-2" />
                        ) : (
                            <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4 mr-2" />
                        )}
                        {isLoadingSuggestions ? t`Getting suggestions...` : t`AI Suggestions`}
                    </Button>
                </div>

                {suggestedItems.length > 0 && (
                    <Card variant="outlined" className="border-primary/20 bg-primary-container/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-on-primary-container">
                                <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4 text-primary" />
                                {t`AI Suggestions`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {suggestedItems.map((item, index) => (
                                    <Chip
                                        key={index}
                                        variant="assist"
                                        onClick={() => handleAddSuggestedItem(item)}
                                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                                    >
                                        <span className="mr-2">{item}</span>
                                        <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                                    </Chip>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6">
                        <Input
                            placeholder={t`Item name`}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                        />
                    </div>
                    <div className="col-span-2">
                        <Input
                            type="number"
                            placeholder={t`Qty`}
                            value={newItemQty}
                            onChange={(e) => setNewItemQty(e.target.value)}
                            min="1"
                            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                        />
                    </div>
                    <div className="col-span-2">
                        <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UN">{t`Unit`}</SelectItem>
                                <SelectItem value="KG">{t`Kg`}</SelectItem>
                                <SelectItem value="L">{t`Liter`}</SelectItem>
                                <SelectItem value="G">{t`Gram`}</SelectItem>
                                <SelectItem value="ML">{t`ML`}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2">
                        <Button onClick={handleAddItem} className="w-full">
                            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {pendingItems.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{t`To Buy`}</span>
                                <Chip variant="assist" size="small" className="bg-primary text-on-primary">
                                    {pendingItems.length}
                                </Chip>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {pendingItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:bg-surface-variant/30 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                checked={item.checked}
                                                onCheckedChange={() => handleToggleItem(item)}
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-medium text-on-surface">{item.name}</span>
                                                <span className="text-body-small text-on-surface-variant">
                                                    {item.quantity} {item.unit}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="text"
                                            size="sm"
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="text-error hover:bg-error-container/50"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {completedItems.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <h3 className="text-lg font-semibold mb-3">{t`Completed`} ({completedItems.length})</h3>
                            <div className="space-y-2">
                                {completedItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                checked={item.checked}
                                                onCheckedChange={() => handleToggleItem(item)}
                                            />
                                            <span className="line-through">{item.name}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {item.quantity} {item.unit}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteItem(item.id)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {items.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">{t`No items in your shopping list yet.`}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t`Add items above or use AI suggestions to get started.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
