import type { PurchaseData } from '@/components/purchases/manual-purchase-form';
import { apiService } from '@/services/api';
import type { ExtractProductDataOutput, Product } from '@/types/ai-flows';
import type { CreatePurchaseItemRequest, MonthlyPurchaseGroup, Purchase } from '@/types/api';

export async function savePurchase(
    familyId: string,
    userId: string,
    purchaseData: ExtractProductDataOutput | PurchaseData,
    products: Product[],
    entryMethod: 'import' | 'manual' | 'nfce',
): Promise<{ success: boolean; purchaseId: string }> {
    if (!familyId || !userId) {
        throw new Error('Family ID and User ID are required.');
    }

    if ('accessKey' in purchaseData && purchaseData.accessKey) {
        const sanitizedKeyAccess = purchaseData.accessKey.replace(/\s/g, '');
        try {
            const existingPurchases = await apiService.getPurchases(familyId);
            const duplicate = existingPurchases.find((p: any) => p.accessKey === sanitizedKeyAccess);
            if (duplicate) {
                throw new Error('This fiscal receipt has already been imported.');
            }
        } catch (error: any) {
            if (error.message === 'This fiscal receipt has already been imported.') {
                throw error;
            }
            console.warn('Could not check for duplicate purchases:', error);
        }
    }

    const totalAmount = products.reduce((acc, item) => {
        const itemTotal = item.price || 0;
        return acc + itemTotal;
    }, 0);

    let purchaseDate: string;
    if (purchaseData.date instanceof Date) {
        purchaseDate = purchaseData.date.toISOString();
    } else if (typeof purchaseData.date === 'string') {
        const dateParts = purchaseData.date.split(/[\/-]/);
        if (dateParts.length === 3) {
            let year, month, day;
            if (dateParts[0].length === 4) {
                year = parseInt(dateParts[0], 10);
                month = parseInt(dateParts[1], 10) - 1;
                day = parseInt(dateParts[2], 10);
            } else {
                day = parseInt(dateParts[0], 10);
                month = parseInt(dateParts[1], 10) - 1;
                year = parseInt(dateParts[2], 10);
            }
            purchaseDate = new Date(year, month, day).toISOString();
        } else {
            purchaseDate = new Date().toISOString();
        }
    } else {
        purchaseDate = new Date().toISOString();
    }

    let storeId = 'unknown';
    if ('cnpj' in purchaseData && purchaseData.cnpj) {
        try {
            const storeData = {
                name: purchaseData.storeName,
                cnpj: purchaseData.cnpj,
                address: purchaseData.address || '',
                type: 'farmacia',
            };
            const store = await apiService.createStore(storeData);
            storeId = store._id;
        } catch (error) {
            console.warn('Could not create store, using unknown:', error);
        }
    }

    const purchaseDataForApi = {
        storeId: storeId,
        storeName: purchaseData.storeName,
        date: purchaseDate,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        discount: 'discount' in purchaseData ? purchaseData.discount || 0 : 0,
        accessKey:
            'accessKey' in purchaseData && purchaseData.accessKey ? purchaseData.accessKey.replace(/\s/g, '') : null,
    };

    try {
        const purchase = await apiService.createPurchase(familyId, purchaseDataForApi);

        if (products && products.length && purchase?._id) {
            const items: CreatePurchaseItemRequest[] = products.map<CreatePurchaseItemRequest>((product) => ({
                name: product.name,
                barcode: product.barcode,
                brand: product.brand,
                category: product.category || 'outros',
                subCategory: product.subcategory,
                quantity: product.quantity || 1,
                price: product.unitPrice || 0,
                total: product.price || 0,
            }));
            try {
                const purchaseId = purchase.id || purchase._id;
                if (purchaseId) {
                    await apiService.bulkUpdatePurchaseItems(familyId, purchaseId, items);
                }
            } catch (e) {
                console.warn('bulkUpdatePurchaseItems failed, skipping attaching items:', e);
            }
        }

        return { success: true, purchaseId: purchase._id };
    } catch (error) {
        console.error('Error saving purchase via API:', error);
        throw error;
    }
}

// Wrapper functions to use API endpoints
export async function getPurchases(familyId: string): Promise<Purchase[]> {
    return apiService.getPurchases(familyId);
}

export async function getPurchasesByMonth(familyId: string): Promise<MonthlyPurchaseGroup[]> {
    try {
        return await apiService.getPurchasesByMonth(familyId);
    } catch (error: any) {
        console.error('Error fetching purchases by month:', error);

        // Create enhanced error with better context
        let errorMessage = 'Failed to fetch monthly purchases';

        if (error && error.status === 400) {
            errorMessage = 'Invalid family ID provided';
        } else if (error && (error.status === 401 || error.status === 403)) {
            errorMessage = 'Authentication required to access purchase data';
        } else if (error && error.status === 404) {
            errorMessage = 'Family not found';
        } else if (error && error.status === 500) {
            errorMessage = 'Server error occurred while fetching purchases';
        } else if (error && (error.message?.includes('Network Error') || error.code === 'NETWORK_ERROR')) {
            errorMessage = 'Network connection failed. Please check your internet connection';
        } else if (error && error.message?.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again';
        } else if (error && error.message) {
            errorMessage = `Failed to fetch monthly purchases: ${error.message}`;
        }

        const enhancedError = new Error(errorMessage);
        enhancedError.cause = error;
        (enhancedError as any).status = error?.status;
        (enhancedError as any).isRetryable =
            (error && [408, 429, 500, 502, 503, 504].includes(error.status)) ||
            (error && error.message?.includes('Network Error')) ||
            (error && error.message?.includes('timeout'));
        throw enhancedError;
    }
}

export async function getPurchase(familyId: string, purchaseId: string): Promise<Purchase> {
    return apiService.getPurchase(familyId, purchaseId);
}

export async function updatePurchase(familyId: string, purchaseId: string, data: any): Promise<Purchase> {
    return apiService.updatePurchase(familyId, purchaseId, data);
}

export async function deletePurchase(
    familyId: string,
    purchaseId: string,
): Promise<{ success: boolean; deletedId: string }> {
    return apiService.deletePurchase(familyId, purchaseId);
}

export async function getAllFamilyPurchaseItems(familyId: string): Promise<{
    [monthYear: string]: {
        [purchaseId: string]: {
            purchaseInfo: {
                date: string;
                storeName?: string;
                storeId: string;
                totalAmount?: number;
                purchasedBy: string;
            };
            items: Array<{
                productId: string;
                name: string;
                description?: string;
                barcode?: string;
                brand?: string;
                category: string;
                subCategory?: string;
                unit: string;
                quantity: number;
                price: number;
                total: number;
            }>;
        };
    };
}> {
    if (!familyId) {
        throw new Error('Family ID is required.');
    }

    try {
        return await apiService.getAllFamilyPurchaseItems(familyId);
    } catch (error: any) {
        const enhancedError = new Error(`Failed to fetch family purchase items: ${error.message}`);
        (enhancedError as any).status = error?.status;
        (enhancedError as any).isRetryable =
            (error && [408, 429, 500, 502, 503, 504].includes(error.status)) ||
            (error && error.message?.includes('Network Error')) ||
            (error && error.message?.includes('timeout'));
        throw enhancedError;
    }
}
