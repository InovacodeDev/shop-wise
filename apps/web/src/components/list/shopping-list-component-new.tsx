import { Button } from "@/components/md3/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/md3/card";
import { Chip } from "@/components/md3/chip";
import { Input } from "@/components/md3/input";
import { LoadingIndicator } from "@/components/md3/loading-indicator";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from '@/hooks/useI18n';
import { cn } from "@/lib/utils";
import { trackEvent } from "@/services/analytics-service";
import { apiService } from "@/services/api";
import type { ShoppingList as ApiShoppingList } from "@/types/api";
import { faArchive, faArrowLeft, faCheck, faEdit, faPlus, faTrash, faUndo, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useState } from "react";
import { suggestMissingItems } from "../../routes/list/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../md3/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface ListItem {
    id: string;
    name: string;
    checked: boolean;
    quantity: number;
    unit: string;
}

interface ListCardProps {
    list: ApiShoppingList;
    onSelectList: (list: ApiShoppingList) => void;
    onUpdateListStatus: (list: ApiShoppingList, status: string) => void;
    onDeleteList: (list: ApiShoppingList) => void;
}

function ListCard({ list, onSelectList, onUpdateListStatus, onDeleteList }: ListCardProps) {
    const { t } = useI18n();

    const itemCount = list.items?.length || 0;
    const completedCount = list.items?.filter(item => item.checked || item.isCompleted)?.length || 0;

    return (
        <Card className="transition-transform duration-300 ease-in-out hover:scale-102 hover:shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span 
                        className="cursor-pointer hover:text-primary transition-colors flex-1"
                        onClick={() => onSelectList(list)}
                    >
                        {list.name}
                    </span>
                    <div className="flex items-center gap-2">
                        {itemCount > 0 && (
                            <Chip variant="assist" size="small">
                                {completedCount}/{itemCount}
                            </Chip>
                        )}
                        <Chip 
                            variant={list.status === 'active' ? 'filter' : 'assist'} 
                            size="small"
                        >
                            {list.status}
                        </Chip>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 ml-2">
                            {list.status === 'active' && (
                                <Button
                                    variant="text"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateListStatus(list, 'completed');
                                    }}
                                    className="text-green-600 hover:bg-green-100"
                                    title={t('markAsCompleted')}
                                >
                                    <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                                </Button>
                            )}
                            
                            {(list.status === 'active' || list.status === 'created') && (
                                <Button
                                    variant="text"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateListStatus(list, 'archived');
                                    }}
                                    className="text-gray-600 hover:bg-gray-100"
                                    title={t('archiveList')}
                                >
                                    <FontAwesomeIcon icon={faArchive} className="h-4 w-4" />
                                </Button>
                            )}

                            {(list.status === 'completed' || list.status === 'archived') && (
                                <Button
                                    variant="text"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateListStatus(list, 'active');
                                    }}
                                    className="text-blue-600 hover:bg-blue-100"
                                    title={t('reactivateList')}
                                >
                                    <FontAwesomeIcon icon={faUndo} className="h-4 w-4" />
                                </Button>
                            )}

                            <Button
                                variant="text"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteList(list);
                                }}
                                className="text-red-600 hover:bg-red-100"
                                title={t('deleteList')}
                            >
                                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-muted-foreground">
                    <p>{t('created')}: {list.createdAt ? new Date(list.createdAt).toLocaleDateString() : t('unknown')}</p>
                    {itemCount > 0 ? (
                        <p className="mt-1">{itemCount} {t('items')}</p>
                    ) : (
                        <p className="mt-1">{t('noItemsYet')}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function ShoppingListComponent() {
    const { t } = useI18n();
    const { profile } = useAuth();
    const { toast } = useToast();

    const [shoppingLists, setShoppingLists] = useState<ApiShoppingList[]>([]);
    const [selectedList, setSelectedList] = useState<ApiShoppingList | null>(null);
    const [viewMode, setViewMode] = useState<'lists' | 'items'>('lists');
    const [activeTab, setActiveTab] = useState<string>('active');
    const [items, setItems] = useState<ListItem[]>([]);
    const [newItemName, setNewItemName] = useState("");
    const [newItemBrand, setNewItemBrand] = useState("NO_BRAND");
    const [newItemQty, setNewItemQty] = useState("1");
    const [newItemUnit, setNewItemUnit] = useState("UN");
    const [newItemCategory, setNewItemCategory] = useState("");
    const [newItemDescription, setNewItemDescription] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [editingItem, setEditingItem] = useState<ListItem | null>(null);
    const [availableBrands, setAvailableBrands] = useState<string[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [availableProductNames, setAvailableProductNames] = useState<string[]>([]);
    const [availableProducts, setAvailableProducts] = useState<any[]>([]);
    const [filteredProductNames, setFilteredProductNames] = useState<string[]>([]);
    const [showProductSuggestions, setShowProductSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [suggestedItems, setSuggestedItems] = useState<string[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isCreatingWithAI, setIsCreatingWithAI] = useState(false);

    const loadShoppingLists = useCallback(
        async (familyId: string) => {
            try {
                const lists = await apiService.getShoppingLists(familyId);
                setShoppingLists(lists);
                return lists;
            } catch (error) {
                console.error('Error loading shopping lists:', error);
                toast({
                    variant: "destructive",
                    title: t('error1'),
                    description: t('couldNotLoadShoppingLists'),
                });
                return [];
            }
        },
        [t, toast]
    );

    const loadItems = useCallback(async (familyId: string, listId: string) => {
        try {
            if (listId) {
                // Get the shopping list with its items
                const shoppingList = await apiService.getShoppingList(familyId, listId);
                
                // Map the items from the shopping list
                if (shoppingList.items && shoppingList.items.length > 0) {
                    setItems(shoppingList.items.map(item => ({
                        id: item.id || item._id || '',
                        name: item.name,
                        checked: item.checked || item.isCompleted || false,
                        quantity: item.quantity,
                        unit: item.unit || ''
                    })));
                } else {
                    setItems([]);
                }
            }
        } catch (error) {
            console.error('Error loading shopping list items:', error);
            toast({
                variant: "destructive",
                title: t('error1'),
                description: t('couldNotLoad1'),
            });
        } finally {
            setLoading(false);
        }
    }, [toast, t]);

    const loadBrands = useCallback(async () => {
        try {
            // TODO: Implement getProducts when API is ready
            const brands: string[] = [];
            setAvailableBrands(brands);
        } catch (error) {
            console.error('Error loading brands:', error);
        }
    }, []);

    const loadCategories = useCallback(async () => {
        try {
            // TODO: Implement getProducts when API is ready
            const categories: string[] = [];
            setAvailableCategories(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }, []);

    const loadProductNames = useCallback(async () => {
        if (!profile?.familyId) return;
        
        try {
            // Get unique product names from shopping lists
            const lists = await apiService.getShoppingLists(profile.familyId);
            const allItems = lists.flatMap(list => list.items || []);
            const uniqueNames = [...new Set(allItems.map(item => item.name).filter(Boolean))].sort();
            
            // Also get product names from the products endpoint
            // TODO: Implement getProducts when API is ready
            const products: any[] = [];
            setAvailableProducts(products);
            const productNames: string[] = [];
            
            // Combine and deduplicate
            const combinedNames = [...new Set([...uniqueNames, ...productNames])].sort();
            setAvailableProductNames(combinedNames);
        } catch (error) {
            console.error('Error loading product names:', error);
        }
    }, [profile?.familyId]);

    const selectList = useCallback((list: ApiShoppingList) => {
        setSelectedList(list);
        setViewMode('items');
        if (profile?.familyId) {
            const listId = list.id || list._id;
            if (listId) {
                setLoading(true);
                loadItems(profile.familyId, listId);
            }
        }
    }, [profile?.familyId, loadItems]);

    const createListWithAI = useCallback(async () => {
        if (!profile?.familyId) return;
        
        setIsCreatingWithAI(true);
        // trackEvent("shopping_list_ai_creation_requested");

        try {
            // Get purchase history for AI
            let purchaseHistory = '';
            try {
                const monthlyGroups = await apiService.getPurchasesByMonth(profile.familyId);
                const allPurchases = monthlyGroups.flatMap(group => group.purchases);
                purchaseHistory = allPurchases.map((purchase: any) =>
                    `${purchase.storeName} - ${new Date(purchase.date).toLocaleDateString()} - R$ ${purchase.totalAmount}`
                ).join('\n');
            } catch (monthlyError) {
                console.warn("Monthly purchase data failed, using flat list for AI:", monthlyError);
                const purchases = await apiService.getPurchases(profile.familyId);
                purchaseHistory = purchases.map((purchase: any) =>
                    `${purchase.storeName} - ${new Date(purchase.date).toLocaleDateString()} - R$ ${purchase.totalAmount}`
                ).join('\n');
            }

            const familySize = (profile.family?.adults || 1) + (profile.family?.children || 0);

            const newList = await apiService.createShoppingList(profile.familyId, {
                listName: t('aiGeneratedShoppingList'),
                familySize,
                preferences: purchaseHistory,
            });

            // Refresh the shopping lists
            const updatedLists = await loadShoppingLists(profile.familyId);
            const createdList = updatedLists.find(list => (list.id || list._id) === (newList.id || newList._id));
            if (createdList) {
                selectList(createdList);
            }

            // trackEvent("shopping_list_ai_creation_completed");
        } catch (error) {
            console.error("Error creating list with AI:", error);
            toast({
                variant: "destructive",
                title: t('error1'),
                description: t('couldNotCreateShoppingListWithAI'),
            });
        } finally {
            setIsCreatingWithAI(false);
        }
    }, [profile, t, toast, loadShoppingLists, selectList]);

    const backToLists = useCallback(() => {
        setViewMode('lists');
        setSelectedList(null);
        setItems([]);
        setSuggestedItems([]);
    }, []);

    const deleteList = useCallback(async (list: ApiShoppingList) => {
        if (!profile?.familyId) return;
        
        const listId = list.id || list._id;
        if (!listId) return;

        const confirmed = window.confirm(
            `${t('areYouSureYouWantToDeleteTheList')} "${list.name}"? ${t('thisActionCannotBeUndone')}`
        );

        if (!confirmed) return;

        try {
            await apiService.deleteShoppingList(profile.familyId, listId);
            
            // Refresh shopping lists
            await loadShoppingLists(profile.familyId);
            
            toast({
                title: t('listDeleted'),
                description: t('shoppingListHasBeenDeletedSuccessfully'),
            });

            // If we're viewing the deleted list, go back to lists view
            if (selectedList && (selectedList.id === list.id || selectedList._id === list._id)) {
                backToLists();
            }

        } catch (error) {
            console.error("Error deleting shopping list:", error);
            toast({
                variant: "destructive",
                title: t('error1'),
                description: t('couldNotDeleteShoppingList'),
            });
        }
    }, [profile?.familyId, selectedList, loadShoppingLists, backToLists, t, toast]);

    const updateListStatus = useCallback(async (list: ApiShoppingList, newStatus: string) => {
        if (!profile?.familyId) return;
        
        const listId = list.id || list._id;
        if (!listId) return;

        try {
            await apiService.updateShoppingList(profile.familyId, listId, {
                status: newStatus
            });
            
            // Refresh shopping lists
            await loadShoppingLists(profile.familyId);
            
            toast({
                title: t('listUpdated'),
                description: t('shoppingListStatusHasBeenUpdated'),
            });

        } catch (error) {
            console.error("Error updating shopping list status:", error);
            toast({
                variant: "destructive",
                title: t('error1'),
                description: t('couldNotUpdateShoppingListStatus'),
            });
        }
    }, [profile?.familyId, loadShoppingLists, t, toast]);

    useEffect(() => {
        if (!profile?.familyId) return;

        setLoading(true);
        Promise.all([
            loadShoppingLists(profile.familyId),
            loadBrands(),
            loadCategories(),
            loadProductNames()
        ]).then(() => {
            setLoading(false);
        });
    }, [profile, loadShoppingLists, loadBrands, loadCategories, loadProductNames]);

    const handleProductNameChange = useCallback((value: string) => {
        setNewItemName(value);
        setSelectedSuggestionIndex(-1); // Reset selection index
        
        if (value.trim().length >= 2) { // Show suggestions only for 2+ characters
            const filtered = availableProductNames.filter(name => 
                name.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 8); // Limit to 8 suggestions for better UX
            setFilteredProductNames(filtered);
            setShowProductSuggestions(filtered.length > 0);
        } else {
            setFilteredProductNames([]);
            setShowProductSuggestions(false);
        }
    }, [availableProductNames]);

    const handleProductNameSelect = useCallback((productName: string) => {
        setNewItemName(productName);
        setShowProductSuggestions(false);
        setSelectedSuggestionIndex(-1);
        
        // Find existing product and auto-fill fields
        const existingProduct = availableProducts.find(p => p.name === productName);
        if (existingProduct) {
            setSelectedProduct(existingProduct);
            setNewItemBrand(existingProduct.brand || "NO_BRAND");
            setNewItemCategory(existingProduct.category || "");
            setNewItemDescription(existingProduct.description || "");
            setNewItemUnit(existingProduct.unit || "UN");
        } else {
            // Clear previous product selection
            setSelectedProduct(null);
            // Keep the current values, don't reset them
        }
    }, [availableProducts]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!showProductSuggestions || filteredProductNames.length === 0) {
            if (e.key === "Enter") {
                e.preventDefault();
                // Call handleAddItem directly to avoid dependency issue
                if (newItemName.trim() !== "" && Number(newItemQty) > 0 && profile?.familyId && selectedList) {
                    const listId = selectedList.id || selectedList._id;
                    if (listId) {
                        handleAddItem();
                    }
                }
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedSuggestionIndex(prev => 
                    prev < filteredProductNames.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedSuggestionIndex(prev => 
                    prev > 0 ? prev - 1 : filteredProductNames.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (selectedSuggestionIndex >= 0) {
                    handleProductNameSelect(filteredProductNames[selectedSuggestionIndex]);
                } else if (newItemName.trim() !== "" && Number(newItemQty) > 0 && profile?.familyId && selectedList) {
                    handleAddItem();
                }
                break;
            case "Escape":
                setShowProductSuggestions(false);
                setSelectedSuggestionIndex(-1);
                break;
        }
    }, [showProductSuggestions, filteredProductNames, selectedSuggestionIndex, handleProductNameSelect, newItemName, newItemQty, profile?.familyId, selectedList]);

    const handleInputBlur = useCallback(() => {
        // Delay hiding suggestions to allow clicking on them
        setTimeout(() => {
            setShowProductSuggestions(false);
            setSelectedSuggestionIndex(-1);
        }, 150);
    }, []);

    const handleAddItem = async () => {
        if (newItemName.trim() !== "" && Number(newItemQty) > 0 && profile?.familyId && selectedList) {
            // If we're editing, call update function instead
            if (editingItem) {
                return handleUpdateItem();
            }
            
            const listId = selectedList.id || selectedList._id;
            if (!listId) return;

            try {
                let productId = selectedProduct?.id || selectedProduct?._id;
                
                // If no existing product selected, create a new one
                if (!selectedProduct && newItemCategory.trim()) {
                    // TODO: Implement createProduct when API is ready
                    console.log('Product creation not implemented yet');
                    productId = `temp-product-${Date.now()}`;
                }

                await apiService.createShoppingListItem(profile.familyId, listId, {
                    name: newItemName.trim(),
                    checked: false,
                    quantity: Number(newItemQty),
                    unit: newItemUnit,
                    brand: newItemBrand !== "NO_BRAND" ? newItemBrand : undefined,
                    productId: productId,
                } as any);

                // Reload items and product names
                loadItems(profile.familyId, listId);
                loadProductNames();

                // Reset form
                handleCancelEdit();
                
                trackEvent("shopping_list_item_added", {
                    item_name: newItemName.trim(),
                    quantity: Number(newItemQty),
                    unit: newItemUnit,
                });
            } catch (error) {
                console.error("Error adding item:", error);
                toast({
                    variant: "destructive",
                    title: t('error1'),
                    description: t('addItem2'),
                });
            }
        }
    };

    const handleToggleItem = async (item: ListItem) => {
        if (!profile?.familyId || !selectedList) return;

        const listId = selectedList.id || selectedList._id;
        if (!listId) return;

        try {
            await apiService.updateShoppingListItem(profile.familyId, listId, item.id, {
                checked: !item.checked
            });

            // Update local state
            setItems(items.map(i => i.id === item.id ? { ...i, checked: !item.checked } : i));
        } catch (error) {
            console.error("Error toggling item:", error);
            toast({
                variant: "destructive",
                title: t('error1'),
                description: t('couldNotUpdate'),
            });
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!profile?.familyId || !selectedList) return;

        const listId = selectedList.id || selectedList._id;
        if (!listId) return;

        try {
            await apiService.deleteShoppingListItem(profile.familyId, listId, id);

            // Update local state
            setItems(items.filter(item => item.id !== id));
        } catch (error) {
            console.error("Error deleting item:", error);
            toast({
                variant: "destructive",
                title: t('error1'),
                description: t('couldNotDelete'),
            });
        }
    };

    const handleEditItem = (item: ListItem) => {
        setEditingItem(item);
        setNewItemName(item.name);
        setNewItemQty(item.quantity.toString());
        setNewItemUnit(item.unit);
        
        // Try to find the associated product
        const associatedProduct = availableProducts.find(p => p.name === item.name);
        if (associatedProduct) {
            setSelectedProduct(associatedProduct);
            setNewItemBrand(associatedProduct.brand || "NO_BRAND");
            setNewItemCategory(associatedProduct.category || "");
            setNewItemDescription(associatedProduct.description || "");
        } else {
            setSelectedProduct(null);
            setNewItemBrand("NO_BRAND");
            setNewItemCategory("");
            setNewItemDescription("");
        }
    };

    const handleUpdateItem = async () => {
        if (!editingItem || !profile?.familyId || !selectedList) return;
        
        const listId = selectedList.id || selectedList._id;
        if (!listId) return;

        try {
            await apiService.updateShoppingListItem(
                profile.familyId, 
                listId, 
                editingItem.id, 
                {
                    name: newItemName.trim(),
                    quantity: Number(newItemQty),
                    unit: newItemUnit,
                    brand: newItemBrand !== "NO_BRAND" ? newItemBrand : undefined,
                } as any
            );

            // Reload items
            loadItems(profile.familyId, listId);
            
            // Reset form
            handleCancelEdit();
            
            toast({
                title: t('itemUpdated'),
                description: t('shoppingListItemHasBeenUpdated'),
            });
        } catch (error) {
            console.error("Error updating item:", error);
            toast({
                variant: "destructive",
                title: t('error1'),
                description: t('couldNotUpdate'),
            });
        }
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setNewItemName("");
        setNewItemBrand("NO_BRAND");
        setNewItemQty("1");
        setNewItemUnit("UN");
        setNewItemCategory("");
        setNewItemDescription("");
        setSelectedProduct(null);
        setShowProductSuggestions(false);
        setFilteredProductNames([]);
        setSelectedSuggestionIndex(-1);
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
                    title: t('error4'),
                    description: result.error,
                });
            } else {
                setSuggestedItems(result.suggestedItems);
            }
        } catch (error) {
            console.error("Error getting suggestions:", error);
            toast({
                variant: "destructive",
                title: t('error1'),
                description: t('couldNotGet'),
            });
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleAddSuggestedItem = async (itemName: string) => {
        if (!profile?.familyId || !selectedList) return;

        const listId = selectedList.id || selectedList._id;
        if (!listId) return;

        try {
            await apiService.createShoppingListItem(profile.familyId, listId, {
                name: itemName,
                checked: false,
                quantity: 1,
                unit: "UN",
            });

            loadItems(profile.familyId, listId);
            setSuggestedItems(suggestedItems.filter(item => item !== itemName));
            trackEvent("shopping_list_item_added", {
                item_name: itemName,
                source: "ai_suggestion",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: t('error1'),
                description: t('addItem3'),
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
                            label={viewMode === 'lists' ? t('loadingShoppingLists'): t('loadingShoppingList')}
                            labelPosition="bottom"
                        />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Shopping Lists Overview
    if (viewMode === 'lists') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{t('shoppingLists')}</h2>
                    {shoppingLists.length === 0 && (
                        <Button
                            onClick={createListWithAI}
                            disabled={isCreatingWithAI}
                            variant="filled"
                            className="gap-2"
                        >
                            {isCreatingWithAI ? (
                                <LoadingIndicator size="xs" className="mr-2" />
                            ) : (
                                <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4" />
                            )}
                            {isCreatingWithAI ? t('creatingList'): t('createListWithAI')}
                        </Button>
                    )}
                </div>

                {shoppingLists.length === 0 ? (
                    <Card className="transition-transform duration-300 ease-in-out hover:scale-102 hover:shadow-xl">
                        <CardContent className="p-8 text-center">
                            <div className="max-w-md mx-auto">
                                <FontAwesomeIcon icon={faWandMagicSparkles} className="h-12 w-12 text-primary mb-4" />
                                <h3 className="text-lg font-semibold mb-2">{t('noShoppingListsYet')}</h3>
                                <p className="text-muted-foreground mb-6">
                                    {t('createYourFirstShoppingListWithAI')}
                                </p>
                                <Button
                                    onClick={createListWithAI}
                                    disabled={isCreatingWithAI}
                                    variant="filled"
                                    size="lg"
                                    className="gap-2"
                                >
                                    {isCreatingWithAI ? (
                                        <LoadingIndicator size="sm" className="mr-2" />
                                    ) : (
                                        <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4" />
                                    )}
                                    {isCreatingWithAI ? t('creatingList'): t('createListWithAI')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Shopping Lists Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList
                                className="w-full flex [&>div]:w-full [&>div]:flex"
                                type="fixed"
                                alignment="fill"
                            >
                                <TabsTrigger value="active" className="text-green-700">
                                    {t('active')} ({shoppingLists.filter(list => list.status === 'active').length})
                                </TabsTrigger>
                                <TabsTrigger value="created" className="text-blue-700">
                                    {t('created')} ({shoppingLists.filter(list => list.status === 'created').length})
                                </TabsTrigger>
                                <TabsTrigger value="completed" className="text-gray-600">
                                    {t('completed')} ({shoppingLists.filter(list => list.status === 'completed').length})
                                </TabsTrigger>
                                <TabsTrigger value="archived" className="text-gray-500">
                                    {t('archived')} ({shoppingLists.filter(list => list.status === 'archived').length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="active" className="mt-4">
                                <div className="grid gap-3">
                                    {shoppingLists.filter(list => list.status === 'active').length > 0 ? (
                                        shoppingLists.filter(list => list.status === 'active').map((list) => (
                                            <ListCard 
                                                key={list.id || list._id} 
                                                list={list} 
                                                onSelectList={selectList}
                                                onUpdateListStatus={updateListStatus}
                                                onDeleteList={deleteList}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">{t('noActiveLists')}</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="created" className="mt-4">
                                <div className="grid gap-3">
                                    {shoppingLists.filter(list => list.status === 'created').length > 0 ? (
                                        shoppingLists.filter(list => list.status === 'created').map((list) => (
                                            <ListCard 
                                                key={list.id || list._id} 
                                                list={list} 
                                                onSelectList={selectList}
                                                onUpdateListStatus={updateListStatus}
                                                onDeleteList={deleteList}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">{t('noCreatedLists')}</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="completed" className="mt-4">
                                <div className="grid gap-3">
                                    {shoppingLists.filter(list => list.status === 'completed').length > 0 ? (
                                        shoppingLists.filter(list => list.status === 'completed').map((list) => (
                                            <ListCard 
                                                key={list.id || list._id} 
                                                list={list} 
                                                onSelectList={selectList}
                                                onUpdateListStatus={updateListStatus}
                                                onDeleteList={deleteList}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">{t('noCompletedLists')}</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="archived" className="mt-4">
                                <div className="grid gap-3">
                                    {shoppingLists.filter(list => list.status === 'archived').length > 0 ? (
                                        shoppingLists.filter(list => list.status === 'archived').map((list) => (
                                            <ListCard 
                                                key={list.id || list._id} 
                                                list={list} 
                                                onSelectList={selectList}
                                                onUpdateListStatus={updateListStatus}
                                                onDeleteList={deleteList}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">{t('noArchivedLists')}</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </div>
        );
    }

    // Individual Shopping List Items View
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Button
                        onClick={backToLists}
                        variant="text"
                        size="sm"
                        className="gap-2"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                        {t('backToLists')}
                    </Button>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold">{selectedList?.name}</h2>
                    </div>
                    <Button
                        onClick={handleGetSuggestions}
                        disabled={isLoadingSuggestions}
                        variant="outlined"
                        size="sm"
                        className={cn(isLoadingSuggestions && "pointer-events-none", "gap-2")}
                    >
                        {isLoadingSuggestions ? (
                            <LoadingIndicator size="xs" />
                        ) : (
                            <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4" />
                        )}
                        {isLoadingSuggestions ? t('gettingSuggestions'): t('aiSuggestions')}
                    </Button>
                </div>

                {suggestedItems.length > 0 && (
                    <Card variant="outlined" className="border-primary/20 bg-primary-container/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-on-primary-container">
                                <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4 text-primary" />
                                {t('aiSuggestions')}
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

                <div className="space-y-3">
                    {/* Item Name - Full width with autocomplete */}
                    <div className="relative">
                        <Input
                            placeholder={t('itemName')}
                            value={newItemName}
                            onChange={(e) => handleProductNameChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleInputBlur}
                            className="rounded-xl"
                        />
                        {showProductSuggestions && filteredProductNames.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-surface border border-outline rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                {filteredProductNames.map((productName, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "px-4 py-3 cursor-pointer text-on-surface transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-outline/20 last:border-b-0",
                                            index === selectedSuggestionIndex 
                                                ? "bg-primary/12 text-primary" 
                                                : "hover:bg-primary/8"
                                        )}
                                        onClick={() => handleProductNameSelect(productName)}
                                    >
                                        <span className="text-sm font-medium">{productName}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Brand, Category, Unit Type, Quantity in one row */}
                    <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3">
                            <Select value={newItemBrand} onValueChange={setNewItemBrand}>
                                <SelectTrigger borderRadius="0.75rem" height="50px">
                                    <SelectValue placeholder={t('brandOptional')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NO_BRAND">{t('noBrand')}</SelectItem>
                                    {availableBrands.map((brand) => (
                                        <SelectItem key={brand} value={brand}>
                                            {brand}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {!selectedProduct && (
                            <div className="col-span-3">
                                <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                                    <SelectTrigger borderRadius="0.75rem" height="50px">
                                        <SelectValue placeholder={t('category')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCategories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className={selectedProduct ? "col-span-3" : "col-span-2"}>
                            <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                                <SelectTrigger borderRadius="0.75rem" height="50px">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UN">{t('unit')}</SelectItem>
                                    <SelectItem value="KG">{t('kg')}</SelectItem>
                                    <SelectItem value="L">{t('L')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2">
                            <Input
                                type="number"
                                placeholder={t('qty')}
                                value={newItemQty}
                                onChange={(e) => setNewItemQty(e.target.value)}
                                min="1"
                                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                                className="rounded-xl"
                            />
                        </div>
                        {editingItem ? (
                            <>
                                <div className="col-span-1">
                                    <Button onClick={handleAddItem} className="px-4">
                                        <FontAwesomeIcon icon={faCheck} />
                                    </Button>
                                </div>
                                <div className="col-span-1">
                                    <Button onClick={handleCancelEdit} variant="text" className="px-4">
                                        <FontAwesomeIcon icon={faUndo} />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="col-span-1">
                                <Button onClick={handleAddItem} className="px-4">
                                    <FontAwesomeIcon icon={faPlus} />
                                </Button>
                            </div>
                        )}
                    </div>
                    
                    {/* Description field for new products (only when category is selected) */}
                    {!selectedProduct && newItemCategory && (
                        <div>
                            <Input
                                placeholder={t('descriptionOptional')}
                                value={newItemDescription}
                                onChange={(e) => setNewItemDescription(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {pendingItems.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{t('toBuy')}</span>
                                <Chip variant="assist" size="small" className="bg-primary text-on-primary">
                                    {pendingItems.length}
                                </Chip>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {pendingItems.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                            editingItem?.id === item.id 
                                                ? "border-primary bg-primary-container/20" 
                                                : "border-outline-variant hover:bg-surface-variant/30"
                                        )}
                                    >
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
                                        <div className="flex gap-1">
                                            <Button
                                                variant="text"
                                                size="sm"
                                                onClick={() => handleEditItem(item)}
                                                className="text-primary hover:bg-primary-container/50"
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="text"
                                                size="sm"
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="text-error hover:bg-error-container/50"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                            </Button>
                                        </div>
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
                            <h3 className="text-lg font-semibold mb-3">{t('completed')} ({completedItems.length})</h3>
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
                        <p className="text-muted-foreground">{t('noItemsInYourShoppingListYet')}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('addItemsAboveOrUseAISuggestions')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
