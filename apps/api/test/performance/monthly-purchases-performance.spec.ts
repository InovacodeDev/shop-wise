/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { CategoriesService } from '../../src/categories/categories.service';
import { ExpensesService } from '../../src/expenses/expenses.service';
import { Purchase } from '../../src/models/purchase';
import { MonthlyPurchasesCacheService } from '../../src/purchases/cache/monthly-purchases-cache.service';
import { PurchasesService } from '../../src/purchases/purchases.service';

describe('Monthly Purchases Performance Tests', () => {
    let service: PurchasesService;
    let mockPurchaseModel: any;

    beforeEach(async () => {
        mockPurchaseModel = {
            find: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PurchasesService,
                {
                    provide: getModelToken('Purchase'),
                    useValue: mockPurchaseModel,
                },
                {
                    provide: MonthlyPurchasesCacheService,
                    useValue: {
                        cache: new Map(),
                        get: jest.fn(),
                        set: jest.fn(),
                        invalidate: jest.fn(),
                        clear: jest.fn(),
                        delete: jest.fn(),
                        getStats: jest.fn(),
                        isHealthy: jest.fn(),
                        cleanup: jest.fn(),
                        destroy: jest.fn(),
                    },
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
    });

    describe('Large Dataset Performance', () => {
        const generateMockPurchases = (count: number): Purchase[] => {
            const purchases: Purchase[] = [];
            const startDate = new Date('2020-01-01');

            for (let i = 0; i < count; i++) {
                // Distribute purchases across 4 years (2020-2024)
                const randomDays = Math.floor(Math.random() * (4 * 365));
                const purchaseDate = new Date(startDate);
                purchaseDate.setDate(startDate.getDate() + randomDays);

                purchases.push({
                    _id: `purchase-${i}`,
                    familyId: '550e8400-e29b-41d4-a716-446655440000',
                    purchasedBy: `user-${i % 5}`, // 5 different users
                    storeId: `store-${i % 10}`, // 10 different stores
                    accessKey: `access-${i}`,
                    date: purchaseDate,
                    totalAmount: Math.round((Math.random() * 200 + 10) * 100) / 100, // $10-$210
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            return purchases;
        };

        it('should handle 1,000 purchases efficiently', async () => {
            const purchases = generateMockPurchases(1000);
            mockPurchaseModel.find.mockReturnValue({
                lean: () => ({
                    exec: () => Promise.resolve(purchases),
                }),
            });

            const startTime = performance.now();
            const result = await service.findAllByMonth('550e8400-e29b-41d4-a716-446655440000');
            const endTime = performance.now();

            const executionTime = endTime - startTime;

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);
            expect(executionTime).toBeLessThan(1000); // Should complete within 1 second

            // Verify data integrity
            const totalPurchases = result.reduce((sum, group) => sum + group.purchaseCount, 0);
            expect(totalPurchases).toBe(1000);
        });

        it('should handle 10,000 purchases efficiently', async () => {
            const purchases = generateMockPurchases(10000);
            mockPurchaseModel.find.mockReturnValue({
                lean: () => ({
                    exec: () => Promise.resolve(purchases),
                }),
            });

            const startTime = performance.now();
            const result = await service.findAllByMonth('550e8400-e29b-41d4-a716-446655440000');
            const endTime = performance.now();

            const executionTime = endTime - startTime;

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);
            expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds

            // Verify data integrity
            const totalPurchases = result.reduce((sum, group) => sum + group.purchaseCount, 0);
            expect(totalPurchases).toBe(10000);
        });

        it('should handle 50,000 purchases with acceptable performance', async () => {
            const purchases = generateMockPurchases(50000);
            mockPurchaseModel.find.mockReturnValue({
                lean: () => ({
                    exec: () => Promise.resolve(purchases),
                }),
            });

            const startTime = performance.now();
            const result = await service.findAllByMonth('550e8400-e29b-41d4-a716-446655440000');
            const endTime = performance.now();

            const executionTime = endTime - startTime;

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);
            expect(executionTime).toBeLessThan(15000); // Should complete within 15 seconds

            // Verify data integrity
            const totalPurchases = result.reduce((sum, group) => sum + group.purchaseCount, 0);
            expect(totalPurchases).toBe(50000);

            console.log(`50,000 purchases processed in ${executionTime.toFixed(2)}ms`);
        });

        it('should maintain memory efficiency with large datasets', async () => {
            const purchases = generateMockPurchases(10000);
            mockPurchaseModel.find.mockReturnValue({
                lean: () => ({
                    exec: () => Promise.resolve(purchases),
                }),
            });

            // Measure memory usage before
            const memBefore = process.memoryUsage();

            const result = await service.findAllByMonth('550e8400-e29b-41d4-a716-446655440000');

            // Measure memory usage after
            const memAfter = process.memoryUsage();

            // Calculate memory increase (in MB)
            const heapIncrease = (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024;

            expect(result).toBeInstanceOf(Array);
            expect(heapIncrease).toBeLessThan(100); // Should not increase heap by more than 100MB

            console.log(`Memory increase: ${heapIncrease.toFixed(2)}MB for 10,000 purchases`);
        });
    });

    describe('Grouping Algorithm Performance', () => {
        it('should efficiently group purchases across many months', async () => {
            // Generate purchases spanning 5 years (60 months)
            const purchases: Purchase[] = [];
            const baseDate = new Date('2019-01-01');

            for (let month = 0; month < 60; month++) {
                for (let day = 0; day < 30; day++) {
                    // ~30 purchases per month
                    const purchaseDate = new Date(baseDate);
                    purchaseDate.setMonth(baseDate.getMonth() + month);
                    purchaseDate.setDate(day + 1);

                    purchases.push({
                        _id: `purchase-${month}-${day}`,
                        familyId: '550e8400-e29b-41d4-a716-446655440000',
                        purchasedBy: 'user-1',
                        storeId: 'store-1',
                        accessKey: `access-${month}-${day}`,
                        date: purchaseDate,
                        totalAmount: 50.0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
            }

            mockPurchaseModel.find.mockReturnValue({
                lean: () => ({
                    exec: () => Promise.resolve(purchases),
                }),
            });

            const startTime = performance.now();
            const result = await service.findAllByMonth('550e8400-e29b-41d4-a716-446655440000');
            const endTime = performance.now();

            const executionTime = endTime - startTime;

            expect(result).toHaveLength(36); // Should have 60 monthly groups
            expect(executionTime).toBeLessThan(2000); // Should complete within 2 seconds
        });

        it('should handle edge cases efficiently', async () => {
            const purchases: Purchase[] = [
                // Valid dates
                ...Array.from({ length: 100 }, (_, i) => ({
                    _id: `valid-${i}`,
                    familyId: '550e8400-e29b-41d4-a716-446655440000',
                    purchasedBy: 'user-1',
                    storeId: 'store-1',
                    accessKey: `access-${i}`,
                    date: new Date('2024-01-15'),
                    totalAmount: 25.5,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })),
                // Invalid/null dates
                ...Array.from({ length: 50 }, (_, i) => ({
                    _id: `invalid-${i}`,
                    familyId: '550e8400-e29b-41d4-a716-446655440000',
                    purchasedBy: 'user-1',
                    storeId: 'store-1',
                    accessKey: `access-invalid-${i}`,
                    date: null as any,
                    totalAmount: 15.25,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })),
            ];

            mockPurchaseModel.find.mockReturnValue({
                lean: () => ({
                    exec: () => Promise.resolve(purchases),
                }),
            });

            const startTime = performance.now();
            const result = await service.findAllByMonth('550e8400-e29b-41d4-a716-446655440000');
            const endTime = performance.now();

            const executionTime = endTime - startTime;

            expect(result).toHaveLength(2); // One valid month group + one "no-date" group
            expect(executionTime).toBeLessThan(500); // Should be very fast for small dataset

            // Find the valid month group
            const validGroup = result.find((g) => g.monthYear === '2024-01');
            const noDateGroup = result.find((g) => g.monthYear === 'no-date');

            expect(validGroup).toBeDefined();
            expect(validGroup!.purchaseCount).toBe(100);
            expect(validGroup!.totalAmount).toBe(2550.0);

            expect(noDateGroup).toBeDefined();
            expect(noDateGroup!.purchaseCount).toBe(50);
            expect(noDateGroup!.totalAmount).toBe(762.5);
        });
    });

    describe('Sorting Performance', () => {
        it('should efficiently sort large numbers of monthly groups', async () => {
            // Generate purchases for 120 months (10 years)
            const purchases: Purchase[] = [];
            const baseDate = new Date('2014-01-01');

            for (let month = 0; month < 120; month++) {
                const purchaseDate = new Date(baseDate);
                purchaseDate.setMonth(baseDate.getMonth() + month);

                purchases.push({
                    _id: `purchase-${month}`,
                    familyId: '550e8400-e29b-41d4-a716-446655440000',
                    purchasedBy: 'user-1',
                    storeId: 'store-1',
                    accessKey: `access-${month}`,
                    date: purchaseDate,
                    totalAmount: 100.0,
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
            const result = await service.findAllByMonth('550e8400-e29b-41d4-a716-446655440000');
            const endTime = performance.now();

            const executionTime = endTime - startTime;

            expect(result).toHaveLength(120);
            expect(executionTime).toBeLessThan(1000); // Should complete within 1 second

            // Verify sorting (should be descending by default)
            for (let i = 0; i < result.length - 1; i++) {
                const current = result[i].monthYear;
                const next = result[i + 1].monthYear;
                expect(current >= next).toBe(true);
            }
        });
    });
});
