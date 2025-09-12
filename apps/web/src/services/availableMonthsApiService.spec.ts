import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getAvailableMonths, 
  getAvailableMonthsSummary, 
  getAvailableMonthsInRange,
  getRecentAvailableMonths,
  getAvailableMonthsForYear,
  getAvailableYears
} from './availableMonthsApiService';
import { apiService } from './api';
import type { AvailableMonth, AvailableMonthsSummary } from '@/types/api';

// Mock the apiService
vi.mock('./api', () => ({
  apiService: {
    getAvailableMonths: vi.fn(),
    getAvailableMonthsSummary: vi.fn(),
  }
}));

describe('availableMonthsApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAvailableMonths: AvailableMonth[] = [
    {
      monthYear: '2024-03',
      displayName: 'March 2024',
      purchaseCount: 5,
      totalAmount: 250.75,
      earliestPurchase: '2024-03-01T10:00:00Z',
      latestPurchase: '2024-03-30T15:30:00Z',
    },
    {
      monthYear: '2024-02',
      displayName: 'February 2024',
      purchaseCount: 3,
      totalAmount: 150.50,
      earliestPurchase: '2024-02-05T09:15:00Z',
      latestPurchase: '2024-02-28T14:45:00Z',
    },
    {
      monthYear: '2024-01',
      displayName: 'January 2024',
      purchaseCount: 8,
      totalAmount: 400.25,
      earliestPurchase: '2024-01-02T08:30:00Z',
      latestPurchase: '2024-01-31T17:20:00Z',
    },
    {
      monthYear: '2023-12',
      displayName: 'December 2023',
      purchaseCount: 4,
      totalAmount: 200.00,
      earliestPurchase: '2023-12-01T11:00:00Z',
      latestPurchase: '2023-12-31T16:45:00Z',
    },
    {
      monthYear: 'no-date',
      displayName: 'No Date',
      purchaseCount: 2,
      totalAmount: 75.00,
      earliestPurchase: null,
      latestPurchase: null,
    },
  ];

  const mockSummary: AvailableMonthsSummary = {
    totalMonths: 5,
    totalPurchases: 22,
    totalAmount: 1076.50,
    averagePurchasesPerMonth: 4.4,
    averageAmountPerMonth: 215.30,
    earliestMonth: '2023-12',
    latestMonth: '2024-03',
    highestSpendingMonth: mockAvailableMonths[2], // January 2024
    mostActiveMonth: mockAvailableMonths[2], // January 2024
  };

  describe('getAvailableMonths', () => {
    it('should call apiService.getAvailableMonths with correct family ID', async () => {
      const familyId = 'test-family-id';
      (apiService.getAvailableMonths as any).mockResolvedValue(mockAvailableMonths);

      const result = await getAvailableMonths(familyId);

      expect(apiService.getAvailableMonths).toHaveBeenCalledWith(familyId);
      expect(result).toEqual(mockAvailableMonths);
    });

    it('should handle API errors with enhanced error message', async () => {
      const familyId = 'test-family-id';
      const originalError = new Error('Network timeout');

      (apiService.getAvailableMonths as any).mockRejectedValue(originalError);

      await expect(getAvailableMonths(familyId)).rejects.toThrow('Failed to fetch available months: Network timeout');
    });

    it('should preserve original error as cause in enhanced error', async () => {
      const familyId = 'test-family-id';
      const originalError = new Error('API server error');

      (apiService.getAvailableMonths as any).mockRejectedValue(originalError);

      try {
        await getAvailableMonths(familyId);
      } catch (error: any) {
        expect(error.cause).toBe(originalError);
        expect(error.message).toContain('Failed to fetch available months');
      }
    });
  });

  describe('getAvailableMonthsSummary', () => {
    it('should call apiService.getAvailableMonthsSummary with correct family ID', async () => {
      const familyId = 'test-family-id';
      (apiService.getAvailableMonthsSummary as any).mockResolvedValue(mockSummary);

      const result = await getAvailableMonthsSummary(familyId);

      expect(apiService.getAvailableMonthsSummary).toHaveBeenCalledWith(familyId);
      expect(result).toEqual(mockSummary);
    });

    it('should handle API errors with enhanced error message', async () => {
      const familyId = 'test-family-id';
      const originalError = new Error('Server error');

      (apiService.getAvailableMonthsSummary as any).mockRejectedValue(originalError);

      await expect(getAvailableMonthsSummary(familyId)).rejects.toThrow('Failed to fetch available months summary: Server error');
    });
  });

  describe('getAvailableMonthsInRange', () => {
    it('should filter months within the specified range', async () => {
      const familyId = 'test-family-id';
      (apiService.getAvailableMonths as any).mockResolvedValue(mockAvailableMonths);

      const result = await getAvailableMonthsInRange(familyId, '2024-01', '2024-02');

      expect(result).toHaveLength(2);
      expect(result[0].monthYear).toBe('2024-02');
      expect(result[1].monthYear).toBe('2024-01');
    });

    it('should exclude no-date entries from range filtering', async () => {
      const familyId = 'test-family-id';
      (apiService.getAvailableMonths as any).mockResolvedValue(mockAvailableMonths);

      const result = await getAvailableMonthsInRange(familyId, '2023-01', '2025-12');

      expect(result).toHaveLength(4); // Should exclude 'no-date' entry
      expect(result.every(month => month.monthYear !== 'no-date')).toBe(true);
    });

    it('should return empty array when no months match the range', async () => {
      const familyId = 'test-family-id';
      (apiService.getAvailableMonths as any).mockResolvedValue(mockAvailableMonths);

      const result = await getAvailableMonthsInRange(familyId, '2025-01', '2025-12');

      expect(result).toHaveLength(0);
    });
  });

  describe('getRecentAvailableMonths', () => {
    it('should return the most recent N months', async () => {
      const familyId = 'test-family-id';
      (apiService.getAvailableMonths as any).mockResolvedValue(mockAvailableMonths);

      const result = await getRecentAvailableMonths(familyId, 3);

      expect(result).toHaveLength(3);
      expect(result[0].monthYear).toBe('2024-03');
      expect(result[1].monthYear).toBe('2024-02');
      expect(result[2].monthYear).toBe('2024-01');
    });

    it('should default to 6 months when count is not specified', async () => {
      const familyId = 'test-family-id';
      (apiService.getAvailableMonths as any).mockResolvedValue(mockAvailableMonths);

      const result = await getRecentAvailableMonths(familyId);

      expect(result).toHaveLength(4); // Only 4 months with dates in mock data
      expect(result.every(month => month.monthYear !== 'no-date')).toBe(true);
    });

    it('should exclude no-date entries', async () => {
      const familyId = 'test-family-id';
      (apiService.getAvailableMonths as any).mockResolvedValue(mockAvailableMonths);

      const result = await getRecentAvailableMonths(familyId, 10);

      expect(result.every(month => month.monthYear !== 'no-date')).toBe(true);
    });
  });

  describe('getAvailableMonthsForYear', () => {
    it('should return months for the specified year', async () => {
      const familyId = 'test-family-id';
      (apiService.getAvailableMonths as any).mockResolvedValue(mockAvailableMonths);

      const result = await getAvailableMonthsForYear(familyId, 2024);

      expect(result).toHaveLength(3);
      expect(result[0].monthYear).toBe('2024-03');
      expect(result[1].monthYear).toBe('2024-02');
      expect(result[2].monthYear).toBe('2024-01');
    });

    it('should return empty array when no months exist for the year', async () => {
      const familyId = 'test-family-id';
      (apiService.getAvailableMonths as any).mockResolvedValue(mockAvailableMonths);

      const result = await getAvailableMonthsForYear(familyId, 2022);

      expect(result).toHaveLength(0);
    });

    it('should exclude no-date entries', async () => {
      const familyId = 'test-family-id';
      (apiService.getAvailableMonths as any).mockResolvedValue(mockAvailableMonths);

      const result = await getAvailableMonthsForYear(familyId, 2024);

      expect(result.every(month => month.monthYear !== 'no-date')).toBe(true);
    });
  });

  describe('getAvailableYears', () => {
    it('should return unique years in descending order', async () => {
      const familyId = 'test-family-id';
      (apiService.getAvailableMonths as any).mockResolvedValue(mockAvailableMonths);

      const result = await getAvailableYears(familyId);

      expect(result).toEqual([2024, 2023]);
    });

    it('should exclude no-date entries', async () => {
      const familyId = 'test-family-id';
      const monthsWithNoDate = [
        ...mockAvailableMonths,
        {
          monthYear: 'no-date',
          displayName: 'No Date',
          purchaseCount: 5,
          totalAmount: 100.00,
          earliestPurchase: null,
          latestPurchase: null,
        },
      ];
      (apiService.getAvailableMonths as any).mockResolvedValue(monthsWithNoDate);

      const result = await getAvailableYears(familyId);

      expect(result).toEqual([2024, 2023]);
    });

    it('should return empty array when no valid years exist', async () => {
      const familyId = 'test-family-id';
      const noDateMonths = [
        {
          monthYear: 'no-date',
          displayName: 'No Date',
          purchaseCount: 5,
          totalAmount: 100.00,
          earliestPurchase: null,
          latestPurchase: null,
        },
      ];
      (apiService.getAvailableMonths as any).mockResolvedValue(noDateMonths);

      const result = await getAvailableYears(familyId);

      expect(result).toEqual([]);
    });

    it('should handle invalid month year formats gracefully', async () => {
      const familyId = 'test-family-id';
      const invalidMonths = [
        {
          monthYear: 'invalid-format',
          displayName: 'Invalid',
          purchaseCount: 1,
          totalAmount: 50.00,
          earliestPurchase: null,
          latestPurchase: null,
        },
        {
          monthYear: '2024-03',
          displayName: 'March 2024',
          purchaseCount: 2,
          totalAmount: 100.00,
          earliestPurchase: '2024-03-01T10:00:00Z',
          latestPurchase: '2024-03-30T15:30:00Z',
        },
      ];
      (apiService.getAvailableMonths as any).mockResolvedValue(invalidMonths);

      const result = await getAvailableYears(familyId);

      expect(result).toEqual([2024]); // Should only include valid year
    });
  });

  describe('Error Handling', () => {
    it('should log errors to console', async () => {
      const familyId = 'test-family-id';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const originalError = new Error('Test error');

      (apiService.getAvailableMonths as any).mockRejectedValue(originalError);

      try {
        await getAvailableMonths(familyId);
      } catch {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching available months:', originalError);
      
      consoleSpy.mockRestore();
    });

    it('should handle errors in derived functions', async () => {
      const familyId = 'test-family-id';
      const originalError = new Error('API error');

      (apiService.getAvailableMonths as any).mockRejectedValue(originalError);

      await expect(getRecentAvailableMonths(familyId)).rejects.toThrow('Failed to fetch recent available months');
      await expect(getAvailableMonthsForYear(familyId, 2024)).rejects.toThrow('Failed to fetch available months for year');
      await expect(getAvailableYears(familyId)).rejects.toThrow('Failed to fetch available years');
    });
  });
});