import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiService } from './api';
import type { MonthlyPurchaseGroup, Purchase } from '@/types/api';

describe('ApiService.refreshAuthToken', () => {
  let svc: ApiService;

  beforeEach(() => {
    svc = new ApiService();
    // Ensure no persisted tokens
    (svc as any).persistTokens = false;
  });

  it('uses backend refresh when refresh token present', async () => {
    // Provide an in-memory backend refresh token
    (svc as any).inMemoryBackendRefreshToken = 'fake-refresh';

    // Stub makeRequest to assert it's called with /auth/refresh
    const makeRequestSpy = vi.spyOn(svc as any, 'makeRequest').mockImplementation(async (...args: any[]) => {
      const endpoint = args[0] as string;
      expect(endpoint).toBe('/auth/refresh');
      return { token: 'new-jwt', refresh: 'new-refresh' } as any;
    });

    const token = await svc.refreshAuthToken();
    expect(token).toBe('new-jwt');
    expect((svc as any).inMemoryBackendRefreshToken).toBe('new-refresh');
    makeRequestSpy.mockRestore();
  });
});

describe('ApiService.getPurchasesByMonth', () => {
  let svc: ApiService;

  beforeEach(() => {
    svc = new ApiService();
    (svc as any).persistTokens = false;
  });

  it('calls the correct endpoint with family ID', async () => {
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

    const makeRequestSpy = vi.spyOn(svc as any, 'makeRequest').mockImplementation(async (...args: any[]) => {
      const endpoint = args[0];
      expect(endpoint).toBe(`/families/${familyId}/purchases/by-month`);
      return mockResponse;
    });

    const result = await svc.getPurchasesByMonth(familyId);
    
    expect(result).toEqual(mockResponse);
    expect(makeRequestSpy).toHaveBeenCalledWith(`/families/${familyId}/purchases/by-month`);
    
    makeRequestSpy.mockRestore();
  });

  it('returns empty array when no monthly groups exist', async () => {
    const familyId = 'test-family-id';
    const mockResponse: MonthlyPurchaseGroup[] = [];

    const makeRequestSpy = vi.spyOn(svc as any, 'makeRequest').mockImplementation(async () => {
      return mockResponse;
    });

    const result = await svc.getPurchasesByMonth(familyId);
    
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    
    makeRequestSpy.mockRestore();
  });

  it('handles API errors properly', async () => {
    const familyId = 'test-family-id';
    const errorMessage = 'Network error';

    const makeRequestSpy = vi.spyOn(svc as any, 'makeRequest').mockImplementation(async () => {
      throw new Error(errorMessage);
    });

    await expect(svc.getPurchasesByMonth(familyId)).rejects.toThrow(errorMessage);
    
    makeRequestSpy.mockRestore();
  });

  it('returns properly structured monthly purchase groups', async () => {
    const familyId = 'test-family-id';
    const mockPurchases: Purchase[] = [
      {
        _id: 'purchase-1',
        familyId,
        storeId: 'store-1',
        storeName: 'Test Store',
        date: '2024-01-15T10:00:00Z',
        totalAmount: 75.25
      },
      {
        _id: 'purchase-2',
        familyId,
        storeId: 'store-2',
        storeName: 'Another Store',
        date: '2024-01-10T14:30:00Z',
        totalAmount: 45.75
      }
    ];

    const mockResponse: MonthlyPurchaseGroup[] = [
      {
        monthYear: '2024-01',
        displayName: 'January 2024',
        totalAmount: 121.00,
        purchaseCount: 2,
        purchases: mockPurchases
      }
    ];

    const makeRequestSpy = vi.spyOn(svc as any, 'makeRequest').mockImplementation(async () => {
      return mockResponse;
    });

    const result = await svc.getPurchasesByMonth(familyId);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      monthYear: '2024-01',
      displayName: 'January 2024',
      totalAmount: 121.00,
      purchaseCount: 2,
      purchases: expect.any(Array)
    });
    expect(result[0].purchases).toHaveLength(2);
    
    makeRequestSpy.mockRestore();
  });
});
