import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { randomUUID } from 'node:crypto';

import { CategoriesService } from '../../src/categories/categories.service';
import { ExpensesService } from '../../src/expenses/expenses.service';
import { MonthlyPurchasesCacheService } from '../../src/purchases/cache/monthly-purchases-cache.service';
import { CreatePurchaseDto } from '../../src/purchases/dto/create-purchase.dto';
import { PurchasesController } from '../../src/purchases/purchases.controller';
import { PurchasesService } from '../../src/purchases/purchases.service';
import { PurchaseDocument, PurchaseSchema } from '../../src/purchases/schemas/purchase.schema';

jest.setTimeout(30000);

describe('Available Months Integration', () => {
    let controller: PurchasesController;
    let service: PurchasesService;
    let mongod: MongoMemoryServer;
    let mongooseConn: typeof mongoose;
    let PurchaseModel: Model<PurchaseDocument>;

    beforeAll(async () => {
        // Start in-memory MongoDB
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        mongooseConn = await mongoose.connect(uri, { dbName: 'test-available-months' });
        PurchaseModel = mongooseConn.model<PurchaseDocument>('Purchase', PurchaseSchema);

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PurchasesController],
            providers: [
                PurchasesService,
                {
                    provide: 'PurchaseModel',
                    useValue: PurchaseModel,
                },
                // Mock ExpensesService and CategoriesService required by PurchasesService constructor
                {
                    provide: ExpensesService,
                    useValue: {
                        // add any methods used by PurchasesService if needed later
                    },
                },
                {
                    provide: CategoriesService,
                    useValue: {
                        // stub
                    },
                },
                {
                    provide: MonthlyPurchasesCacheService,
                    useValue: {
                        cache: new Map(),
                        get: jest.fn(() => {
                            return null; // For available months test, just return null
                        }),
                        set: jest.fn(),
                        invalidate: jest.fn(),
                        clear: jest.fn(),
                        getStats: jest.fn(),
                        isHealthy: jest.fn(),
                        cleanup: jest.fn(),
                        destroy: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<PurchasesController>(PurchasesController);
        service = module.get<PurchasesService>(PurchasesService);
    });

    afterAll(async () => {
        if (mongooseConn) {
            await mongooseConn.disconnect();
        }
        if (mongod) {
            await mongod.stop();
        }
    });

    beforeEach(async () => {
        // Clear all collections before each test
        await PurchaseModel.deleteMany({});
    });

    describe('getAvailableMonths', () => {
        const familyId = randomUUID();
        const userId = randomUUID();

        it('should return empty array for family with no purchases', async () => {
            const result = await controller.getAvailableMonths(familyId);
            expect(result).toEqual([]);
        });

        it('should return available months with correct metadata', async () => {
            const purchases: CreatePurchaseDto[] = [
                {
                    storeId: 'store-1',
                    storeName: 'Store 1',
                    date: '2024-03-15T10:00:00.000Z',
                    totalAmount: 125.5,
                    discount: 0,
                    accessKey: randomUUID(),
                },
                {
                    storeId: 'store-2',
                    storeName: 'Store 2',
                    date: '2024-03-25T14:30:00.000Z',
                    totalAmount: 75.25,
                    discount: 0,
                    accessKey: randomUUID(),
                },
                {
                    storeId: 'store-3',
                    storeName: 'Store 3',
                    date: '2024-02-10T09:15:00.000Z',
                    totalAmount: 50.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
            ];

            for (const purchase of purchases) {
                await service.create(familyId, purchase, userId);
            }

            const result = await controller.getAvailableMonths(familyId);

            expect(result).toHaveLength(2);

            // Should be sorted by month descending
            expect(result[0].monthYear).toBe('2024-03');
            expect(result[0].displayName).toBe('March 2024');
            expect(result[0].purchaseCount).toBe(2);
            expect(result[0].totalAmount).toBe(200.75);
            expect(result[0].earliestPurchase).toBe('2024-03-15T10:00:00.000Z');
            expect(result[0].latestPurchase).toBe('2024-03-25T14:30:00.000Z');

            expect(result[1].monthYear).toBe('2024-02');
            expect(result[1].displayName).toBe('February 2024');
            expect(result[1].purchaseCount).toBe(1);
            expect(result[1].totalAmount).toBe(50.0);
            expect(result[1].earliestPurchase).toBe('2024-02-10T09:15:00.000Z');
            expect(result[1].latestPurchase).toBe('2024-02-10T09:15:00.000Z');
        });

        it('should handle purchases with null dates', async () => {
            const purchases: CreatePurchaseDto[] = [
                {
                    storeId: 'store-1',
                    storeName: 'Store 1',
                    date: '2024-03-15T10:00:00.000Z',
                    totalAmount: 100.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
                {
                    storeId: 'store-2',
                    storeName: 'Store 2',
                    date: '',
                    totalAmount: 50.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
            ];

            for (const purchase of purchases) {
                await service.create(familyId, purchase, userId);
            }

            const result = await controller.getAvailableMonths(familyId);

            expect(result).toHaveLength(2);

            // Valid date month should come first
            expect(result[0].monthYear).toBe('2024-03');
            expect(result[0].displayName).toBe('March 2024');

            // No date group should come last
            expect(result[1].monthYear).toBe('no-date');
            expect(result[1].displayName).toBe('No Date');
            expect(result[1].purchaseCount).toBe(1);
            expect(result[1].totalAmount).toBe(50.0);
            expect(result[1].earliestPurchase).toBeNull();
            expect(result[1].latestPurchase).toBeNull();
        });

        it('should handle purchases across multiple years', async () => {
            const purchases: CreatePurchaseDto[] = [
                {
                    storeId: 'store-1',
                    storeName: 'Store 1',
                    date: '2024-01-15T10:00:00.000Z',
                    totalAmount: 100.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
                {
                    storeId: 'store-2',
                    storeName: 'Store 2',
                    date: '2023-12-20T14:30:00.000Z',
                    totalAmount: 75.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
                {
                    storeId: 'store-3',
                    storeName: 'Store 3',
                    date: '2023-01-10T09:15:00.000Z',
                    totalAmount: 50.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
            ];

            for (const purchase of purchases) {
                await service.create(familyId, purchase, userId);
            }

            const result = await controller.getAvailableMonths(familyId);

            expect(result).toHaveLength(3);

            // Should be sorted by month descending
            expect(result[0].monthYear).toBe('2024-01');
            expect(result[0].displayName).toBe('January 2024');

            expect(result[1].monthYear).toBe('2023-12');
            expect(result[1].displayName).toBe('December 2023');

            expect(result[2].monthYear).toBe('2023-01');
            expect(result[2].displayName).toBe('January 2023');
        });
    });

    describe('getAvailableMonthsSummary', () => {
        const familyId = randomUUID();
        const userId = randomUUID();

        it('should return empty summary for family with no purchases', async () => {
            const result = await controller.getAvailableMonthsSummary(familyId);

            expect(result).toEqual({
                totalMonths: 0,
                totalPurchases: 0,
                totalAmount: 0,
                averagePurchasesPerMonth: 0,
                averageAmountPerMonth: 0,
                earliestMonth: null,
                latestMonth: null,
                highestSpendingMonth: null,
                mostActiveMonth: null,
            });
        });

        it('should calculate summary statistics correctly', async () => {
            const purchases: CreatePurchaseDto[] = [
                // March 2024 - 2 purchases, $200.75 total
                {
                    storeId: 'store-1',
                    storeName: 'Store 1',
                    date: '2024-03-15T10:00:00.000Z',
                    totalAmount: 125.5,
                    discount: 0,
                    accessKey: randomUUID(),
                },
                {
                    storeId: 'store-2',
                    storeName: 'Store 2',
                    date: '2024-03-25T14:30:00.000Z',
                    totalAmount: 75.25,
                    discount: 0,
                    accessKey: randomUUID(),
                },
                // February 2024 - 1 purchase, $50.00 total
                {
                    storeId: 'store-3',
                    storeName: 'Store 3',
                    date: '2024-02-10T09:15:00.000Z',
                    totalAmount: 50.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
                // January 2024 - 3 purchases, $300.00 total
                {
                    storeId: 'store-4',
                    storeName: 'Store 4',
                    date: '2024-01-05T08:00:00.000Z',
                    totalAmount: 100.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
                {
                    storeId: 'store-5',
                    storeName: 'Store 5',
                    date: '2024-01-15T12:00:00.000Z',
                    totalAmount: 100.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
                {
                    storeId: 'store-6',
                    storeName: 'Store 6',
                    date: '2024-01-25T16:00:00.000Z',
                    totalAmount: 100.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
            ];

            for (const purchase of purchases) {
                await service.create(familyId, purchase, userId);
            }

            const result = await controller.getAvailableMonthsSummary(familyId);

            expect(result.totalMonths).toBe(3);
            expect(result.totalPurchases).toBe(6);
            expect(result.totalAmount).toBe(550.75);
            expect(result.averagePurchasesPerMonth).toBe(2);
            expect(result.averageAmountPerMonth).toBe(183.58);
            expect(result.earliestMonth).toBe('2024-01');
            expect(result.latestMonth).toBe('2024-03');

            // January should be the most active month (3 purchases)
            expect(result.mostActiveMonth?.monthYear).toBe('2024-01');
            expect(result.mostActiveMonth?.purchaseCount).toBe(3);

            // January should also be the highest spending month ($300.00)
            expect(result.highestSpendingMonth?.monthYear).toBe('2024-01');
            expect(result.highestSpendingMonth?.totalAmount).toBe(300.0);
        });

        it('should handle months with equal spending and purchase counts', async () => {
            const purchases: CreatePurchaseDto[] = [
                {
                    storeId: 'store-1',
                    storeName: 'Store 1',
                    date: '2024-03-15T10:00:00.000Z',
                    totalAmount: 100.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
                {
                    storeId: 'store-2',
                    storeName: 'Store 2',
                    date: '2024-02-15T10:00:00.000Z',
                    totalAmount: 100.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
            ];

            for (const purchase of purchases) {
                await service.create(familyId, purchase, userId);
            }

            const result = await controller.getAvailableMonthsSummary(familyId);

            expect(result.totalMonths).toBe(2);
            expect(result.totalPurchases).toBe(2);
            expect(result.totalAmount).toBe(200.0);
            expect(result.averagePurchasesPerMonth).toBe(1);
            expect(result.averageAmountPerMonth).toBe(100.0);

            // Should return the first month found (March in this case due to sorting)
            expect(result.mostActiveMonth?.monthYear).toBe('2024-03');
            expect(result.highestSpendingMonth?.monthYear).toBe('2024-03');
        });

        it('should exclude no-date entries from earliest/latest month calculation', async () => {
            const purchases: CreatePurchaseDto[] = [
                {
                    storeId: 'store-1',
                    storeName: 'Store 1',
                    date: '2024-03-15T10:00:00.000Z',
                    totalAmount: 100.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
                {
                    storeId: 'store-2',
                    storeName: 'Store 2',
                    date: '',
                    totalAmount: 50.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
                {
                    storeId: 'store-3',
                    storeName: 'Store 3',
                    date: '2024-01-15T10:00:00.000Z',
                    totalAmount: 75.0,
                    discount: 0,
                    accessKey: randomUUID(),
                },
            ];

            for (const purchase of purchases) {
                await service.create(familyId, purchase, userId);
            }

            const result = await controller.getAvailableMonthsSummary(familyId);

            expect(result.totalMonths).toBe(3); // Includes no-date group
            expect(result.totalPurchases).toBe(3);
            expect(result.totalAmount).toBe(225.0);
            expect(result.earliestMonth).toBe('2024-01'); // Excludes no-date
            expect(result.latestMonth).toBe('2024-03'); // Excludes no-date
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid family ID in getAvailableMonths', async () => {
            await expect(controller.getAvailableMonths('invalid-uuid')).rejects.toThrow();
        });

        it('should handle invalid family ID in getAvailableMonthsSummary', async () => {
            await expect(controller.getAvailableMonthsSummary('invalid-uuid')).rejects.toThrow();
        });

        it('should handle non-existent family gracefully', async () => {
            const nonExistentFamilyId = randomUUID();

            const availableMonths = await controller.getAvailableMonths(nonExistentFamilyId);
            expect(availableMonths).toEqual([]);

            const summary = await controller.getAvailableMonthsSummary(nonExistentFamilyId);
            expect(summary.totalMonths).toBe(0);
            expect(summary.totalPurchases).toBe(0);
        });
    });

    describe('Data Consistency', () => {
        const familyId = randomUUID();
        const userId = randomUUID();

        it('should maintain consistency between available months and monthly groups', async () => {
            const purchases: CreatePurchaseDto[] = [
                {
                    storeId: 'store-1',
                    storeName: 'Store 1',
                    date: '2024-03-15T10:00:00.000Z',
                    totalAmount: 125.5,
                    discount: 0,
                    accessKey: randomUUID(),
                },
                {
                    storeId: 'store-2',
                    storeName: 'Store 2',
                    date: '2024-02-10T09:15:00.000Z',
                    totalAmount: 75.25,
                    discount: 0,
                    accessKey: randomUUID(),
                },
            ];

            for (const purchase of purchases) {
                await service.create(familyId, purchase, userId);
            }

            const availableMonths = await controller.getAvailableMonths(familyId);
            const monthlyGroups = await controller.findAllByMonth(familyId);

            // Should have same number of months
            expect(availableMonths).toHaveLength(monthlyGroups.length);

            // Should have same month keys
            const availableMonthKeys = availableMonths.map((m) => m.monthYear).sort();
            const monthlyGroupKeys = monthlyGroups.map((g) => g.monthYear).sort();
            expect(availableMonthKeys).toEqual(monthlyGroupKeys);

            // Should have same totals for each month
            for (const availableMonth of availableMonths) {
                const correspondingGroup = monthlyGroups.find((g) => g.monthYear === availableMonth.monthYear);
                expect(correspondingGroup).toBeDefined();
                if (correspondingGroup) {
                    expect(availableMonth.totalAmount).toBe(correspondingGroup.totalAmount);
                    expect(availableMonth.purchaseCount).toBe(correspondingGroup.purchaseCount);
                    expect(availableMonth.displayName).toBe(correspondingGroup.displayName);
                }
            }
        });
    });
});
