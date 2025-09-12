import { apiService } from '@/services/api';
import PQueue from 'p-queue';

// Global queue for purchase items requests to avoid API rate limits (1 request per 10s)
export const purchaseItemsQueue = new PQueue({
    interval: 10_000,
    intervalCap: 1,
    carryoverConcurrencyCount: true,
});

export function enqueueGetPurchaseItems(familyId: string, purchaseId: string) {
    return purchaseItemsQueue.add(() => apiService.getPurchaseItems(familyId, purchaseId));
}

export default purchaseItemsQueue;
