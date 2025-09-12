import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Purchase } from '@/types/api';
import { Card, CardContent } from '@/components/md3/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faShoppingCart, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { useLingui, Plural } from '@lingui/react/macro';

interface VirtualPurchaseListProps {
    purchases: Purchase[];
    onPurchaseSelect?: (purchase: Purchase) => void;
    height?: number;
    itemHeight?: number;
}

interface PurchaseItemProps {
    index: number;
    style: React.CSSProperties;
    data: {
        purchases: Purchase[];
        onPurchaseSelect?: (purchase: Purchase) => void;
        t: (str: any) => string;
    };
}

const PurchaseItem = React.memo(function PurchaseItem({ index, style, data }: PurchaseItemProps) {
    const { purchases, onPurchaseSelect, t } = data;
    const purchase = purchases[index];

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

    const handleClick = useCallback(() => {
        if (onPurchaseSelect) {
            onPurchaseSelect(purchase);
        }
    }, [onPurchaseSelect, purchase]);

    return (
        <div style={style} className="px-2">
            <Card
                className={`transition-all duration-200 ${onPurchaseSelect ? 'hover:shadow-md cursor-pointer hover:bg-accent/50' : ''
                    }`}
                onClick={handleClick}
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
        </div>
    );
});

export function VirtualPurchaseList({
    purchases,
    onPurchaseSelect,
    height = 400,
    itemHeight = 80
}: VirtualPurchaseListProps) {
    const { t } = useLingui();
    const listRef = useRef<List>(null);

    const itemData = useMemo(() => ({
        purchases,
        onPurchaseSelect,
        t,
    }), [purchases, onPurchaseSelect, t]);

    // Reset scroll position when purchases change
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollToItem(0);
        }
    }, [purchases]);

    if (purchases.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
                {t`No purchases to display`}
            </div>
        );
    }

    return (
        <div className="border rounded-md">
            <List
                ref={listRef}
                height={height}
                width="100%"
                itemCount={purchases.length}
                itemSize={itemHeight}
                itemData={itemData}
                overscanCount={5} // Render 5 extra items for smooth scrolling
            >
                {PurchaseItem}
            </List>
        </div>
    );
}