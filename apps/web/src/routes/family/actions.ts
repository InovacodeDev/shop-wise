import { apiService } from '@/services/api';

export interface PurchaseItem {
    id: string;
    productId: string;
    barcode?: string;
    name?: string;
    volume?: string;
    quantity: number;
    price: number;
    unitPrice?: number;
    category?: string;
}

const getOrCreateProduct = async (productData: any) => {
    // A new item without barcode won't be saved as a global product
    if (!productData.barcode) return null;

    const formattedBarcode = productData.barcode.replace(/\D/g, '');
    if (!formattedBarcode) return null;

    try {
        // Try to get existing product
        const existingProducts = await apiService.getProducts();
        const existingProduct = existingProducts.find((p: any) => p.barcode === productData.barcode);

        if (!existingProduct) {
            // Create new product
            const newProduct = await apiService.createProduct({
                name: productData.name,
                barcode: productData.barcode,
                brand: productData.brand || null,
                category: productData.category || 'Outros',
                subcategory: productData.subcategory || null,
                volume: productData.volume || null,
            });
            return newProduct.id;
        }

        return existingProduct.id;
    } catch (error) {
        console.error('Error creating/getting product:', error);
        return null;
    }
};

export async function updatePurchaseItems(familyId: string, purchaseId: string, items: PurchaseItem[]) {
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

                const itemData = {
                    productId: productId,
                    name: item.name,
                    barcode: item.barcode,
                    volume: item.volume,
                    quantity: item.quantity,
                    price: item.price,
                    unitPrice: item.unitPrice || item.price / item.quantity,
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
