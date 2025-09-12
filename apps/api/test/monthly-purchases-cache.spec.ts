/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { MonthlyPurchaseGroup } from '../src/models/monthly-purchase-group';
import { Purchase } from '../src/models/purchase';
import { MonthlyPurchasesCacheService } from '../src/purchases/cache/monthly-purchases-cache.service';

describe('MonthlyPurchasesCacheService', () => {
    let service: MonthlyPurchasesCacheService;

    beforeEach(() => {
        service = new MonthlyPurchasesCacheService();
    });

    afterEach(() => {
        service.destroy();
    });

    const createMockPurchase = (id: string): Purchase => ({
        _id: id,
        familyId: 'family-1',
        purchasedBy: 'user-1',
        storeId: 'store-1',
        accessKey: `access-${id}`,
        date: new Date('2024-01-15'),
        totalAmount: 100.0,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const createMockMonthlyGroup = (monthYear: string, purchaseCount: number): MonthlyPurchaseGroup => ({
        monthYear,
        displayName: `Test ${monthYear}`,
        totalAmount: purchaseCount * 100,
        purchaseCount,
        purchases: Array.from({ length: purchaseCount }, (_, i) => createMockPurchase(`${monthYear}-${i}`)),
    });

    describe('Basic Cache Operations', () => {
        it('should return null for non-existent cache entry', () => {
            const result = service.get('non-existent-family');
            expect(result).toBeNull();
        });

        it('should store and retrieve cache entry', () => {
            const familyId = 'family-1';
            const mockData = [createMockMonthlyGroup('2024-01', 5)];

            service.set(familyId, mockData);
            const result = service.get(familyId);

            expect(result).toEqual(mockData);
            expect(result).not.toBe(mockData); // Should be a deep clone
        });

        it('should invalidate specific family cache', () => {
            const familyId = 'family-1';
            const mockData = [createMockMonthlyGroup('2024-01', 5)];

            service.set(familyId, mockData);
            expect(service.get(familyId)).toEqual(mockData);

            service.invalidate(familyId);
            expect(service.get(familyId)).toBeNull();
        });

        it('should clear all cache entries', () => {
            const mockData1 = [createMockMonthlyGroup('2024-01', 5)];
            const mockData2 = [createMockMonthlyGroup('2024-02', 3)];

            service.set('family-1', mockData1);
            service.set('family-2', mockData2);

            expect(service.get('family-1')).toEqual(mockData1);
            expect(service.get('family-2')).toEqual(mockData2);

            service.clear();

            expect(service.get('family-1')).toBeNull();
            expect(service.get('family-2')).toBeNull();
        });
    });

    describe('TTL (Time To Live)', () => {
        it('should return null for expired cache entry', (done) => {
            const familyId = 'family-1';
            const mockData = [createMockMonthlyGroup('2024-01', 5)];

            // Mock a very short TTL for testing
            const originalTTL = (service as any).TTL_MS;
            (service as any).TTL_MS = 50; // 50ms

            service.set(familyId, mockData);
            expect(service.get(familyId)).toEqual(mockData);

            setTimeout(() => {
                expect(service.get(familyId)).toBeNull();
                (service as any).TTL_MS = originalTTL; // Restore original TTL
                done();
            }, 100);
        });

        it('should cleanup expired entries', (done) => {
            const familyId = 'family-1';
            const mockData = [createMockMonthlyGroup('2024-01', 5)];

            // Mock a very short TTL for testing
            const originalTTL = (service as any).TTL_MS;
            (service as any).TTL_MS = 50; // 50ms

            service.set(familyId, mockData);
            expect(service.get(familyId)).toEqual(mockData);

            setTimeout(() => {
                service.cleanup();
                const stats = service.getStats();
                expect(stats.size).toBe(0);
                (service as any).TTL_MS = originalTTL; // Restore original TTL
                done();
            }, 100);
        });
    });

    describe('Cache Size Management', () => {
        it('should evict oldest entry when cache is full', () => {
            // Mock a small cache size for testing
            const originalMaxSize = (service as any).MAX_CACHE_SIZE;
            (service as any).MAX_CACHE_SIZE = 3;

            const mockData1 = [createMockMonthlyGroup('2024-01', 1)];
            const mockData2 = [createMockMonthlyGroup('2024-02', 1)];
            const mockData3 = [createMockMonthlyGroup('2024-03', 1)];
            const mockData4 = [createMockMonthlyGroup('2024-04', 1)];

            // Fill cache to capacity
            service.set('family-1', mockData1);
            service.set('family-2', mockData2);
            service.set('family-3', mockData3);

            // Verify all entries are cached
            expect(service.get('family-1')).toEqual(mockData1);
            expect(service.get('family-2')).toEqual(mockData2);
            expect(service.get('family-3')).toEqual(mockData3);

            // Add one more entry, should evict the oldest
            service.set('family-4', mockData4);

            // The oldest entry (family-1) should be evicted
            expect(service.get('family-1')).toBeNull();
            expect(service.get('family-2')).toEqual(mockData2);
            expect(service.get('family-3')).toEqual(mockData3);
            expect(service.get('family-4')).toEqual(mockData4);

            (service as any).MAX_CACHE_SIZE = originalMaxSize; // Restore original size
        });
    });

    describe('Cache Statistics', () => {
        it('should provide accurate cache statistics', () => {
            const mockData1 = [createMockMonthlyGroup('2024-01', 5)];
            const mockData2 = [createMockMonthlyGroup('2024-02', 3)];

            service.set('family-1', mockData1);
            service.set('family-2', mockData2);

            const stats = service.getStats();

            expect(stats.size).toBe(2);
            expect(stats.maxSize).toBeGreaterThan(0);
            expect(stats.memoryUsage).toBeGreaterThan(0);
            expect(typeof stats.hitRate).toBe('number');
        });

        it('should report healthy status', () => {
            expect(service.isHealthy()).toBe(true);
        });
    });

    describe('Data Integrity', () => {
        it('should not allow external mutation of cached data', () => {
            const familyId = 'family-1';
            const mockData = [createMockMonthlyGroup('2024-01', 5)];

            service.set(familyId, mockData);
            const cachedData = service.get(familyId);

            // Mutate the returned data
            if (cachedData) {
                cachedData[0].totalAmount = 999999;
                cachedData[0].purchases.push(createMockPurchase('malicious-purchase'));
            }

            // Original cached data should remain unchanged
            const freshData = service.get(familyId);
            expect(freshData![0].totalAmount).toBe(500); // Original value
            expect(freshData![0].purchases).toHaveLength(5); // Original length
        });

        it('should handle empty data arrays', () => {
            const familyId = 'family-1';
            const emptyData: MonthlyPurchaseGroup[] = [];

            service.set(familyId, emptyData);
            const result = service.get(familyId);

            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBe(true);
        });

        it('should handle complex nested data structures', () => {
            const familyId = 'family-1';
            const complexData = [
                {
                    monthYear: '2024-01',
                    displayName: 'January 2024',
                    totalAmount: 1500.75,
                    purchaseCount: 10,
                    purchases: Array.from({ length: 10 }, (_, i) => ({
                        ...createMockPurchase(`complex-${i}`),
                        items: [
                            { name: `Item ${i}-1`, price: 25.5 },
                            { name: `Item ${i}-2`, price: 75.25 },
                        ],
                    })),
                },
            ];

            service.set(familyId, complexData as any);
            const result = service.get(familyId);

            expect(result).toEqual(complexData);
            expect(result![0].purchases[0].items).toHaveLength(2);
        });
    });

    describe('Performance', () => {
        it('should handle large datasets efficiently', () => {
            const familyId = 'family-1';
            const largeData = Array.from({ length: 100 }, (_, i) =>
                createMockMonthlyGroup(`2024-${String(i + 1).padStart(2, '0')}`, 50),
            );

            const setStart = performance.now();
            service.set(familyId, largeData);
            const setEnd = performance.now();

            const getStart = performance.now();
            const result = service.get(familyId);
            const getEnd = performance.now();

            expect(result).toHaveLength(100);
            expect(setEnd - setStart).toBeLessThan(1000); // Should set within 1 second
            expect(getEnd - getStart).toBeLessThan(100); // Should get within 100ms

            console.log(`Cache set time: ${(setEnd - setStart).toFixed(2)}ms`);
            console.log(`Cache get time: ${(getEnd - getStart).toFixed(2)}ms`);
        });

        it('should maintain performance with frequent operations', () => {
            const operationCount = 1000;
            const mockData = [createMockMonthlyGroup('2024-01', 10)];

            const start = performance.now();

            for (let i = 0; i < operationCount; i++) {
                const familyId = `family-${i % 100}`; // Cycle through 100 families
                service.set(familyId, mockData);
                service.get(familyId);
            }

            const end = performance.now();
            const totalTime = end - start;
            const avgTimePerOperation = totalTime / (operationCount * 2); // 2 operations per iteration

            expect(avgTimePerOperation).toBeLessThan(1); // Should average less than 1ms per operation

            console.log(`Average time per cache operation: ${avgTimePerOperation.toFixed(3)}ms`);
        });
    });

    describe('Error Handling', () => {
        it('should handle null/undefined data gracefully', () => {
            const familyId = 'family-1';

            expect(() => service.set(familyId, null as any)).not.toThrow();
            expect(() => service.set(familyId, undefined as any)).not.toThrow();
        });

        it('should handle invalid family IDs gracefully', () => {
            const mockData = [createMockMonthlyGroup('2024-01', 5)];

            expect(() => service.set('', mockData)).not.toThrow();
            expect(() => service.set(null as any, mockData)).not.toThrow();
            expect(() => service.get('')).not.toThrow();
            expect(() => service.get(null as any)).not.toThrow();
        });

        it('should handle service destruction gracefully', () => {
            const familyId = 'family-1';
            const mockData = [createMockMonthlyGroup('2024-01', 5)];

            service.set(familyId, mockData);
            expect(service.get(familyId)).toEqual(mockData);

            service.destroy();

            expect(service.get(familyId)).toBeNull();
            expect(service.isHealthy()).toBe(false);
        });
    });
});
