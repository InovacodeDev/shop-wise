import { apiService } from '@/services/api';
import type { ApiPurchaseItem } from '@/types/api';

// Web-compatible PurchaseItem extends the canonical API item with a few optional UI fields
// Use ApiPurchaseItem directly; web may extend it where needed in local components
export type WebPurchaseItem = ApiPurchaseItem &
    Partial<{ id: string; barcode?: string; volume?: string; unitPrice?: number; productRef?: any }>;

const getOrCreateProduct = async (productData: any) => {
    // A new item without barcode won't be saved as a global product
    if (!productData.barcode) return null;

    const formattedBarcode = productData.barcode.replace(/\D/g, '');
    if (!formattedBarcode) return null;

    try {
        // TODO: Implement getProducts and createProduct methods when API is ready
        // For now, return a placeholder ID
        console.log('Product creation not implemented yet:', productData);
        return `temp-product-${Date.now()}`;
    } catch (error) {
        console.error('Error creating/getting product:', error);
        return null;
    }
};

export async function updatePurchaseItems(familyId: string, purchaseId: string, items: WebPurchaseItem[]) {
    try {
        // 1. Get all existing items to find which ones to delete
        const existingItems = await apiService.getPurchaseItems(familyId, purchaseId);
        const existingIds = new Set(existingItems.map((item: any) => item.id));

        // 2. Prepare parallel operations for better performance
        const operations: Promise<any>[] = [];

        // Process each item in parallel
        for (const item of items) {
            const processItem = async () => {
                // Get or create product if it has a barcode
                let productId = null;
                if (item.barcode) {
                    productId = await getOrCreateProduct({
                        name: item.name,
                        barcode: item.barcode,
                        volume: item.volume,
                    });
                }

                const q = item.quantity ?? 1;
                const p = item.price ?? 0;

                const itemData = {
                    productId: productId,
                    name: item.name,
                    barcode: item.barcode,
                    volume: item.volume,
                    quantity: item.quantity,
                    price: item.price,
                    unitPrice: item.unitPrice ?? p / q,
                    // total is required by CreatePurchaseItemRequest
                    total: (item.unitPrice ?? p / q) * q,
                    category: item.category,
                };

                if (item.id && existingIds.has(item.id)) {
                    // Update existing item
                    await apiService.updatePurchaseItem(familyId, purchaseId, item.id, itemData);
                    existingIds.delete(item.id);
                } else {
                    // Create new item
                    await apiService.createPurchaseItem(familyId, purchaseId, itemData);
                }
            };

            operations.push(processItem());
        }

        // Execute all item operations in parallel
        await Promise.all(operations);

        // 3. Delete items that are no longer in the list (in parallel)
        const deleteOperations = Array.from(existingIds).map((idToDelete) =>
            apiService.deletePurchaseItem(familyId, purchaseId, idToDelete),
        );

        if (deleteOperations.length > 0) {
            await Promise.all(deleteOperations);
        }
    } catch (error) {
        console.error('Error updating purchase items:', error);
        throw error;
    }
}
