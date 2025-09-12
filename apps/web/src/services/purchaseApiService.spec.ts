import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPurchasesByMonth } from './purchaseApiService';
import { apiService } from './api';
import type { MonthlyPurchaseGroup } from '@/types/api';

// Mock the apiService
vi.mock('./api', () => ({
  apiService: {
    getPurchasesByMonth: vi.fn()
  }
}));

describe('purchaseApiService.getPurchasesByMonth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls apiService.getPurchasesByMonth with correct family ID', async () => {
    const familyId = 'test-family-id';
    const mockResponse: MonthlyPurchaseGroup[] = [
      {
        monthYear: '2024-01',
        displayName: 'January 2024',
        totalAmount: 150.50,
        purchaseCount: 3,
        purchases: []
      }
    ];

    (apiService.getPurchasesByMonth as any).mockResolvedValue(mockResponse);

    const result = await getPurchasesByMonth(familyId);

    expect(apiService.getPurchasesByMonth).toHaveBeenCalledWith(familyId);
    expect(result).toEqual(mockResponse);
  });

  it('returns empty array when no monthly groups exist', async () => {
    const familyId = 'test-family-id';
    const mockResponse: MonthlyPurchaseGroup[] = [];

    (apiService.getPurchasesByMonth as any).mockResolvedValue(mockResponse);

    const result = await getPurchasesByMonth(familyId);

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('handles API errors with enhanced error message', async () => {
    const familyId = 'test-family-id';
    const originalError = new Error('Network timeout');

    (apiService.getPurchasesByMonth as any).mockRejectedValue(originalError);

    await expect(getPurchasesByMonth(familyId)).rejects.toThrow('Failed to fetch monthly purchases: Network timeout');
  });

  it('preserves original error as cause in enhanced error', async () => {
    const familyId = 'test-family-id';
    const originalError = new Error('API server error');

    (apiService.getPurchasesByMonth as any).mockRejectedValue(originalError);

    try {
      await getPurchasesByMonth(familyId);
    } catch (error: any) {
      expect(error.cause).toBe(originalError);
      expect(error.message).toContain('Failed to fetch monthly purchases');
    }
  });

  it('logs error to console when API call fails', async () => {
    const familyId = 'test-family-id';
    const originalError = new Error('Server error');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    (apiService.getPurchasesByMonth as any).mockRejectedValue(originalError);

    try {
      await getPurchasesByMonth(familyId);
    } catch {
      // Expected to throw
    }

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching purchases by month:', originalError);
    
    consoleSpy.mockRestore();
  });

  it('returns properly structured monthly purchase groups', async () => {
    const familyId = 'test-family-id';
    const mockResponse: MonthlyPurchaseGroup[] = [
      {
        monthYear: '2024-02',
        displayName: 'February 2024',
        totalAmount: 89.99,
        purchaseCount: 1,
        purchases: [
          {
            _id: 'purchase-1',
            familyId,
            storeId: 'store-1',
            storeName: 'Grocery Store',
            date: '2024-02-15T10:00:00Z',
            totalAmount: 89.99
          }
        ]
      },
      {
        monthYear: '2024-01',
        displayName: 'January 2024',
        totalAmount: 245.50,
        purchaseCount: 2,
        purchases: [
          {
            _id: 'purchase-2',
            familyId,
            storeId: 'store-2',
            storeName: 'Pharmacy',
            date: '2024-01-20T14:30:00Z',
            totalAmount: 125.25
          },
          {
            _id: 'purchase-3',
            familyId,
            storeId: 'store-1',
            storeName: 'Grocery Store',
            date: '2024-01-10T09:15:00Z',
            totalAmount: 120.25
          }
        ]
      }
    ];

    (apiService.getPurchasesByMonth as any).mockResolvedValue(mockResponse);

    const result = await getPurchasesByMonth(familyId);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      monthYear: '2024-02',
      displayName: 'February 2024',
      totalAmount: 89.99,
      purchaseCount: 1
    });
    expect(result[1]).toMatchObject({
      monthYear: '2024-01',
      displayName: 'January 2024',
      totalAmount: 245.50,
      purchaseCount: 2
    });
    expect(result[0].purchases).toHaveLength(1);
    expect(result[1].purchases).toHaveLength(2);
  });
});