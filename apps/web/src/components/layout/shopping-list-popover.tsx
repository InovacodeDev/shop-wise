import { useState, useEffect, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/md3/button";
import { useAuth } from "@/hooks/use-auth";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { useLingui } from '@lingui/react/macro';
import { apiService } from "@/services/api";

interface ListItem {
    id: string;
    name: string;
    checked: boolean;
}

export function ShoppingListPopover() {
    const { t } = useLingui();
    const { profile } = useAuth();
    const [items, setItems] = useState<ListItem[]>([]);
    const [activeListId, setActiveListId] = useState<string | null>(null);
    const [listName, setListName] = useState("");

    const getActiveList = useCallback(async (familyId: string) => {
        try {
            const lists = await apiService.getShoppingLists(familyId);
            const activeList = lists.find(list => list.status === 'active');

            if (activeList) {
                setActiveListId(activeList.id || activeList._id);
                setListName(activeList.name);
                return activeList.id;
            }
            return null;
        } catch (error) {
            console.error('Error fetching active list:', error);
            return null;
        }
    }, []);

    useEffect(() => {
        if (!profile?.familyId) return;

        getActiveList(profile.familyId).then(async (listId) => {
            if (listId) {
                try {
                    const listItems = await apiService.getShoppingListItems(profile.familyId!, listId);
                    setItems(listItems.map(item => ({
                        id: item.id || item._id,
                        name: item.name,
                        checked: item.checked || false
                    })));
                } catch (error) {
                    console.error('Error fetching shopping list items:', error);
                }
            }
        });

        // Poll for items every 30 seconds
        const intervalId = setInterval(async () => {
            if (activeListId) {
                try {
                    const listItems = await apiService.getShoppingListItems(profile.familyId!, activeListId);
                    setItems(listItems.map(item => ({
                        id: item.id || item._id,
                        name: item.name,
                        checked: item.checked || false
                    })));
                } catch (error) {
                    console.error('Error fetching shopping list items:', error);
                }
            }
        }, 30000);

        return () => clearInterval(intervalId);
    }, [profile, getActiveList, activeListId]);

    const handleToggleItem = async (id: string) => {
        if (!profile?.familyId || !activeListId) return;

        const item = items.find((i) => i.id === id);
        if (item) {
            try {
                await apiService.updateShoppingListItem(profile.familyId, activeListId, id, {
                    checked: !item.checked
                });

                // Update local state
                setItems(items.map(i =>
                    i.id === id ? { ...i, checked: !i.checked } : i
                ));
            } catch (error) {
                console.error('Error updating item:', error);
            }
        }
    };

    const generateGoogleKeepLink = () => {
        const title = encodeURIComponent(listName);
        const text = encodeURIComponent(items.map((item) => `${item.checked ? "☑" : "☐"} ${item.name}`).join("\n"));
        return `https://keep.google.com/u/0/#NOTE/${Date.now()}:${Date.now()}/${title}/${text}`;
    };

    if (items.length === 0) {
        return null;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5" />
                    <span className="sr-only">{t`Active shopping list`}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="flex flex-col space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">{listName}</h4>
                        <p className="text-sm text-muted-foreground">{t`Your active shopping list at the moment.`}</p>
                    </div>
                    <Separator />
                    <ScrollArea className="h-64">
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                                    <Checkbox
                                        id={`popover-item-${item.id}`}
                                        checked={item.checked}
                                        onCheckedChange={() => handleToggleItem(item.id)}
                                    />
                                    <label
                                        htmlFor={`popover-item-${item.id}`}
                                        className={`flex-grow text-sm font-medium ${item.checked ? "line-through text-muted-foreground" : ""
                                            }`}
                                    >
                                        {item.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <Button variant="outlined" asChild>
                            <a href={generateGoogleKeepLink()} target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faGoogle} className="mr-2 h-4 w-4" />
                                {t`Exportar para Google Keep`}
                            </a>
                        </Button>
                        {/* <Button variant="secondary" asChild>
                            <Link to="/list">
                                <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2 h-4 w-4" />
                                {t`View full list`}
                            </Link>
                        </Button> */}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
