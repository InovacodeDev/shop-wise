/* eslint-disable */
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { CategoriesService } from '../../src/categories/categories.service';
import { ExpensesService } from '../../src/expenses/expenses.service';
import { Purchase } from '../../src/models/purchase';
import { MonthlyPurchasesCacheService } from '../../src/purchases/cache/monthly-purchases-cache.service';
import { PurchasesService } from '../../src/purchases/purchases.service';

describe('Monthly Purchases Large Dataset Performance Tests', () => {
    let service: PurchasesService;
    let cacheService: MonthlyPurchasesCacheService;
    let mockPurchaseModel: {
        find: jest.MockedFunction<any>;
        create: jest.MockedFunction<any>;
        findById: jest.MockedFunction<any>;
        findOne: jest.MockedFunction<any>;
        updateOne: jest.MockedFunction<any>;
        deleteOne: jest.MockedFunction<any>;
    };

    const TEST_FAMILY_ID = '550e8400-e29b-41d4-a716-446655440000';

    beforeEach(async () => {
        mockPurchaseModel = {
            find: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
        };

        const _backing = new Map<string, any>();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PurchasesService,
                {
                    provide: MonthlyPurchasesCacheService,
                    useValue: {
                        cache: new Map(),
                        get: jest.fn((k: string) => _backing.get(k) ?? null),
                        set: jest.fn((k: string, v: any) => _backing.set(k, v)),
                        clear: jest.fn(() => _backing.clear()),
                        invalidate: jest.fn((k: string) => _backing.delete(k)),
                        getStats: jest.fn(),
                        isHealthy: jest.fn(),
                        cleanup: jest.fn(),
                        destroy: jest.fn(),
                    },
                },
                {
                    provide: getModelToken('Purchase'),
                    useValue: mockPurchaseModel,
                },
                // Provide minimal stubs for constructor dependencies
                {
                    provide: ExpensesService,
                    useValue: {},
                },
                {
                    provide: CategoriesService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<PurchasesService>(PurchasesService);
        cacheService = module.get<MonthlyPurchasesCacheService>(MonthlyPurchasesCacheService);
    });

    afterEach(() => {
        cacheService.clear();
    });

    const generateLargePurchaseDataset = (count: number): Purchase[] => {
        const purchases: Purchase[] = [];
        const startDate = new Date('2018-01-01');
        const stores = Array.from({ length: 50 }, (_, i) => `Store ${i + 1}`);
        const users = Array.from({ length: 10 }, (_, i) => `user-${i + 1}`);

        for (let i = 0; i < count; i++) {
            // Distribute purchases across 6 years (2018-2024)
            const randomDays = Math.floor(Math.random() * (6 * 365));
            const purchaseDate = new Date(startDate);
            purchaseDate.setDate(startDate.getDate() + randomDays);

            purchases.push({
                _id: `purchase-${i}`,
                familyId: TEST_FAMILY_ID,
                purchasedBy: users[i % users.length],
                storeId: `store-${i % stores.length}`,
                storeName: stores[i % stores.length],
                accessKey: `access-${i}`,
                date: purchaseDate,
                totalAmount: Math.round((Math.random() * 500 + 5) * 100) / 100, // $5-$505
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        return purchases;
    };

    describe('Extreme Large Dataset Performance', () => {
        it('should handle 100,000 purchases with acceptable performance', async () => {
            const purchases = generateLargePurchaseDataset(100000);
            mockPurchaseModel.find.mockReturnValue({
                lean: () => ({
                    exec: () => Promise.resolve(purchases),
                }),
            });

            const startTime = performance.now();
            const result = await service.findAllByMonth(TEST_FAMILY_ID);
            const endTime = performance.now();

            const executionTime = endTime - startTime;

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);
            expect(executionTime).toBeLessThan(30000); // Should complete within 30 seconds

            // Verify data integrity
            const totalPurchases = result.reduce((sum, group) => sum + group.purchaseCount, 0);
            expect(totalPurchases).toBe(100000);

            console.log(`100,000 purchases processed in ${executionTime.toFixed(2)}ms`);
            console.log(`Generated ${result.length} monthly groups`);
        });

        it('should handle 250,000 purchases with memory efficiency', async () => {
            const purchases = generateLargePurchaseDataset(250000);
            mockPurchaseModel.find.mockReturnValue({
                lean: () => ({
                    exec: () => Promise.resolve(purchases),
                }),
            });

            // Measure memory usage before
            const memBefore = process.memoryUsage();

            const startTime = performance.now();
            const result = await service.findAllByMonth(TEST_FAMILY_ID);
            const endTime = performance.now();

            // Measure memory usage after
            const memAfter = process.memoryUsage();

            const executionTime = endTime - startTime;
            const heapIncrease = (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024;

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);
            expect(executionTime).toBeLessThan(60000); // Should complete within 60 seconds
            expect(heapIncrease).toBeLessThan(500); // Should not increase heap by more than 500MB

            console.log(`250,000 purchases processed in ${executionTime.toFixed(2)}ms`);
            console.log(`Memory increase: ${heapIncrease.toFixed(2)}MB`);
            console.log(`Generated ${result.length} monthly groups`);
        });

        it('should demonstrate caching performance benefits', async () => {
            const purchases = generateLargePurchaseDataset(50000);
            mockPurchaseModel.find.mockReturnValue({
                lean: () => ({
                    exec: () => Promise.resolve(purchases),
                }),
            });

            // First call - no cache
            const firstCallStart = performance.now();
            const firstResult = await service.findAllByMonth(TEST_FAMILY_ID);
            const firstCallEnd = performance.now();
            const firstCallTime = firstCallEnd - firstCallStart;

            // Cache the result
            cacheService.set(TEST_FAMILY_ID, firstResult);

            // Second call - with cache
            const secondCallStart = performance.now();
            const cachedResult = cacheService.get(TEST_FAMILY_ID);
            const secondCallEnd = performance.now();
            const secondCallTime = secondCallEnd - secondCallStart;

            expect(cachedResult).not.toBeNull();
            expect(cachedResult).toHaveLength(firstResult.length);
            expect(secondCallTime).toBeLessThan(firstCallTime / 8); // Cache should be at least 8x faster

            console.log(`First call (no cache): ${firstCallTime.toFixed(2)}ms`);
            console.log(`Second call (cached): ${secondCallTime.toFixed(2)}ms`);
            console.log(`Cache speedup: ${(firstCallTime / secondCallTime).toFixed(2)}x`);
        });
    });

    describe('Concurrent Access Performance', () => {
        it('should handle multiple concurrent requests efficiently', async () => {
            const purchases = generateLargePurchaseDataset(25000);
            mockPurchaseModel.find.mockReturnValue({
                lean: () => ({
                    exec: () => Promise.resolve(purchases),
                }),
            });

            const concurrentRequests = 10;
            const familyIds = Array.from(
                { length: concurrentRequests },
                (_, i) => `550e8400-e29b-41d4-a716-44665544000${i}`,
            );

            const startTime = performance.now();

            const promises = familyIds.map((familyId) => service.findAllByMonth(familyId));

            const results = await Promise.all(promises);

            const endTime = performance.now();
            const totalTime = endTime - startTime;

            expect(results).toHaveLength(concurrentRequests);
            results.forEach((result) => {
                expect(result).toBeInstanceOf(Array);
                expect(result.length).toBeGreaterThan(0);
            });

            // Should complete all requests within reasonable time
            expect(totalTime).toBeLessThan(45000); // 45 seconds for 10 concurrent requests

            console.log(`${concurrentRequests} concurrent requests completed in ${totalTime.toFixed(2)}ms`);
            console.log(`Average time per request: ${(totalTime / concurrentRequests).toFixed(2)}ms`);
        });

        it('should maintain cache efficiency under concurrent load', async () => {
            const purchases = generateLargePurchaseDataset(30000);
            mockPurchaseModel.find.mockReturnValue({
                lean: () => ({
                    exec: () => Promise.resolve(purchases),
                }),
            });

            // Pre-populate cache for some families
            const cachedFamilies = [
                '550e8400-e29b-41d4-a716-446655440001',
                '550e8400-e29b-41d4-a716-446655440002',
                '550e8400-e29b-41d4-a716-446655440003',
            ];

            for (const familyId of cachedFamilies) {
                const result = await service.findAllByMonth(familyId);
                cacheService.set(familyId, result);
            }

            // Mix of cached and non-cached requests
            const allFamilies = [
                ...cachedFamilies,
                '550e8400-e29b-41d4-a716-446655440004',
                '550e8400-e29b-41d4-a716-446655440005',
                '550e8400-e29b-41d4-a716-446655440006',
            ];

            const startTime = performance.now();

            const promises = allFamilies.map(async (familyId) => {
                const cached = cacheService.get(familyId);
                if (cached) {
                    return cached;
                }
                return await service.findAllByMonth(familyId);
            });

            const results = await Promise.all(promises);

            const endTime = performance.now();
            const totalTime = endTime - startTime;

            expect(results).toHaveLength(allFamilies.length);
            results.forEach((result) => {
                expect(result).toBeInstanceOf(Array);
                expect(result.length).toBeGreaterThan(0);
            });

            // Should be faster than processing all from scratch
            expect(totalTime).toBeLessThan(20000); // Should benefit from caching

            console.log(`Mixed cached/non-cached requests completed in ${totalTime.toFixed(2)}ms`);
        });
    });

    describe('Edge Case Performance', () => {
        it('should handle datasets with extreme date ranges efficiently', async () => {
            const purchases: Purchase[] = [];

            // Generate purchases spanning 20 years (1990-2010)
            const startDate = new Date('1990-01-01');
            const endDate = new Date('2010-12-31');
            const dayRange = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

            for (let i = 0; i < 50000; i++) {
                const randomDays = Math.floor(Math.random() * dayRange);
                const purchaseDate = new Date(startDate);
                purchaseDate.setDate(startDate.getDate() + randomDays);

                purchases.push({
                    _id: `purchase-${i}`,
                    familyId: TEST_FAMILY_ID,
                    purchasedBy: 'user-1',
                    storeId: 'store-1',
                    storeName: 'Store 1',
                    accessKey: `access-${i}`,
                    date: purchaseDate,
                    totalAmount: 50.0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            mockPurchaseModel.find.mockReturnValue({
                lean: () => ({
                    exec: () => Promise.resolve(purchases),
                }),
            });

            const startTime = performance.now();
            const result = await service.findAllByMonth(TEST_FAMILY_ID);
            const endTime = performance.now();

            const executionTime = endTime - startTime;

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(200); // Should have many monthly groups
            expect(executionTime).toBeLessThan(15000); // Should complete within 15 seconds

            console.log(`20-year date range with 50,000 purchases processed in ${executionTime.toFixed(2)}ms`);
            console.log(`Generated ${result.length} monthly groups`);
        });

        it('should handle datasets with many null/invalid dates efficiently', async () => {
            const purchases: Purchase[] = [];

            // 70% valid dates, 30% null/invalid dates
            for (let i = 0; i < 30000; i++) {
                const hasValidDate = Math.random() > 0.3;
                const purchaseDate = hasValidDate
                    ? new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
                    : null;

                purchases.push({
                    _id: `purchase-${i}`,
                    familyId: TEST_FAMILY_ID,
                    purchasedBy: 'user-1',
                    storeId: 'store-1',
                    storeName: 'Store 1',
                    accessKey: `access-${i}`,
                    date: purchaseDate || undefined,
                    totalAmount: 25.0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            mockPurchaseModel.find.mockReturnValue({
                lean: () => ({
                    exec: () => Promise.resolve(purchases),
                }),
            });

            const startTime = performance.now();
            const result = await service.findAllByMonth(TEST_FAMILY_ID);
            const endTime = performance.now();

            const executionTime = endTime - startTime;

            expect(result).toBeInstanceOf(Array);
            expect(executionTime).toBeLessThan(10000); // Should handle edge cases efficiently

            // Verify "no-date" group exists
            const noDateGroup = result.find((g) => g.monthYear === 'no-date');
            expect(noDateGroup).toBeDefined();
            expect(noDateGroup!.purchaseCount).toBeGreaterThan(0);

            console.log(`30,000 purchases with mixed date validity processed in ${executionTime.toFixed(2)}ms`);
            console.log(`No-date group contains ${noDateGroup!.purchaseCount} purchases`);
        });
    });
});
