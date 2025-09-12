import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { randomUUID } from 'node:crypto';

import { CategoriesService } from '../../src/categories/categories.service';
import { ExpensesService } from '../../src/expenses/expenses.service';
import { MonthlyPurchaseGroup } from '../../src/models/monthly-purchase-group';
import { MonthlyPurchasesCacheService } from '../../src/purchases/cache/monthly-purchases-cache.service';
import { CreatePurchaseDto } from '../../src/purchases/dto/create-purchase.dto';
import { PurchasesController } from '../../src/purchases/purchases.controller';
import { PurchasesService } from '../../src/purchases/purchases.service';
import { PurchaseDocument, PurchaseSchema } from '../../src/purchases/schemas/purchase.schema';

jest.setTimeout(30000);

describe('Monthly Purchases Controller Integration', () => {
    let controller: PurchasesController;
    let service: PurchasesService;
    let mongod: MongoMemoryServer;
    let mongooseConn: typeof mongoose;
    let PurchaseModel: Model<PurchaseDocument>;

    beforeAll(async () => {
        // Start in-memory MongoDB
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        mongooseConn = await mongoose.connect(uri, { dbName: 'test' });
        PurchaseModel = mongooseConn.model<PurchaseDocument>('Purchase', PurchaseSchema);

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PurchasesController],
            providers: [
                PurchasesService,
                {
                    provide: 'PurchaseModel',
                    useValue: PurchaseModel,
                },
                {
                    provide: MonthlyPurchasesCacheService,
                    useValue: {
                        cache: new Map(),
                        get: jest.fn(),
                        set: jest.fn(),
                        invalidate: jest.fn(),
                        clear: jest.fn(),
                        getStats: jest.fn(),
                        isHealthy: jest.fn(),
                        cleanup: jest.fn(),
                        destroy: jest.fn(),
                    },
                },
                // Mock dependencies required by PurchasesService constructor
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

    describe('findAllByMonth', () => {
        const familyId = randomUUID();
        const userId = randomUUID();

        it('should return empty array for family with no purchases', async () => {
            const result = await controller.findAllByMonth(familyId);
            expect(result).toEqual([]);
        });

        it('should return 400 for invalid family ID format', async () => {
            const invalidFamilyId = 'invalid-uuid';

            await expect(controller.findAllByMonth(invalidFamilyId)).rejects.toThrow();
        });

        it('should group purchases by month correctly', async () => {
            // Create purchases in different months
            const jan2024Purchase: CreatePurchaseDto = {
                storeId: 's1',
                storeName: 'Store 1',
                date: '2024-01-15T10:00:00.000Z',
                totalAmount: 100.5,
                discount: 0,
                accessKey: randomUUID(),
            };

            const feb2024Purchase: CreatePurchaseDto = {
                storeId: 's2',
                storeName: 'Store 2',
                date: '2024-02-20T14:30:00.000Z',
                totalAmount: 75.25,
                discount: 5.0,
                accessKey: randomUUID(),
            };

            const jan2024Purchase2: CreatePurchaseDto = {
                storeId: 's3',
                storeName: 'Store 3',
                date: '2024-01-25T16:45:00.000Z',
                totalAmount: 50.0,
                discount: 0,
                accessKey: randomUUID(),
            };

            // Create purchases via service
            await service.create(familyId, jan2024Purchase, userId);
            await service.create(familyId, feb2024Purchase, userId);
            await service.create(familyId, jan2024Purchase2, userId);

            // Test the controller method
            const result = await controller.findAllByMonth(familyId);

            expect(result).toHaveLength(2);

            // Should be sorted by month descending (newest first)
            expect(result[0].monthYear).toBe('2024-02');
            expect(result[0].displayName).toBe('February 2024');
            expect(result[0].purchaseCount).toBe(1);
            expect(result[0].totalAmount).toBe(75.25);
            expect(result[0].purchases).toHaveLength(1);

            expect(result[1].monthYear).toBe('2024-01');
            expect(result[1].displayName).toBe('January 2024');
            expect(result[1].purchaseCount).toBe(2);
            expect(result[1].totalAmount).toBe(150.5);
            expect(result[1].purchases).toHaveLength(2);

            // Verify purchases within months are sorted by date descending
            const jan2024Group = result[1];
            const firstPurchase = new Date(jan2024Group.purchases[0].date!);
            const secondPurchase = new Date(jan2024Group.purchases[1].date!);
            expect(firstPurchase.getTime()).toBeGreaterThan(secondPurchase.getTime());
        });

        it('should handle purchases with null dates', async () => {
            const validPurchase: CreatePurchaseDto = {
                storeId: 's1',
                storeName: 'Store 1',
                date: '2024-01-15T10:00:00.000Z',
                totalAmount: 100.0,
                discount: 0,
                accessKey: randomUUID(),
            };

            const nullDatePurchase: CreatePurchaseDto = {
                storeId: 's2',
                storeName: 'Store 2',
                date: '',
                totalAmount: 50.0,
                discount: 0,
                accessKey: randomUUID(),
            };

            // Create purchases via service
            await service.create(familyId, validPurchase, userId);
            await service.create(familyId, nullDatePurchase, userId);

            const result = await controller.findAllByMonth(familyId);

            expect(result).toHaveLength(2);

            // Valid date group should come first
            expect(result[0].monthYear).toBe('2024-01');
            expect(result[0].displayName).toBe('January 2024');
            expect(result[0].purchaseCount).toBe(1);
            expect(result[0].totalAmount).toBe(100.0);

            // No date group should come last
            expect(result[1].monthYear).toBe('no-date');
            expect(result[1].displayName).toBe('No Date');
            expect(result[1].purchaseCount).toBe(1);
            expect(result[1].totalAmount).toBe(50.0);
        });

        it('should maintain backward compatibility with existing endpoint', async () => {
            const purchase: CreatePurchaseDto = {
                storeId: 's1',
                storeName: 'Store 1',
                date: '2024-01-15T10:00:00.000Z',
                totalAmount: 100.0,
                discount: 0,
                accessKey: randomUUID(),
            };

            // Create purchase via service
            await service.create(familyId, purchase, userId);

            // Test that the original method still works
            const flatResult = await controller.findAll(familyId);
            expect(flatResult).toHaveLength(1);
            expect(flatResult[0].totalAmount).toBe(100.0);

            // Test that the new method also works
            const monthlyResult = await controller.findAllByMonth(familyId);
            expect(monthlyResult).toHaveLength(1);
            expect(monthlyResult[0].totalAmount).toBe(100.0);
            expect(monthlyResult[0].purchases).toHaveLength(1);
        });

        it('should calculate monthly summaries correctly', async () => {
            const purchase1: CreatePurchaseDto = {
                storeId: 's1',
                storeName: 'Store 1',
                date: '2024-01-15T10:00:00.000Z',
                totalAmount: 123.45,
                discount: 0,
                accessKey: randomUUID(),
            };

            const purchase2: CreatePurchaseDto = {
                storeId: 's2',
                storeName: 'Store 2',
                date: '2024-01-20T14:30:00.000Z',
                totalAmount: 76.55,
                discount: 0,
                accessKey: randomUUID(),
            };

            // Create purchases via service
            await service.create(familyId, purchase1, userId);
            await service.create(familyId, purchase2, userId);

            const result = await controller.findAllByMonth(familyId);

            expect(result).toHaveLength(1);
            expect(result[0].totalAmount).toBe(200.0);
            expect(result[0].purchaseCount).toBe(2);
        });

        it('should handle error cases properly', async () => {
            // Test with invalid UUID format
            await expect(controller.findAllByMonth('invalid-uuid')).rejects.toThrow();

            // Test with non-existent family (should return empty array, not error)
            const nonExistentFamilyId = randomUUID();
            const result = await controller.findAllByMonth(nonExistentFamilyId);
            expect(result).toEqual([]);
        });

        it('should return proper MonthlyPurchaseGroup structure', async () => {
            const purchase: CreatePurchaseDto = {
                storeId: 's1',
                storeName: 'Store 1',
                date: '2024-01-15T10:00:00.000Z',
                totalAmount: 100.0,
                discount: 0,
                accessKey: randomUUID(),
            };

            await service.create(familyId, purchase, userId);

            const result = await controller.findAllByMonth(familyId);

            expect(result).toHaveLength(1);

            const group: MonthlyPurchaseGroup = result[0];
            expect(group).toHaveProperty('monthYear');
            expect(group).toHaveProperty('displayName');
            expect(group).toHaveProperty('totalAmount');
            expect(group).toHaveProperty('purchaseCount');
            expect(group).toHaveProperty('purchases');

            expect(typeof group.monthYear).toBe('string');
            expect(typeof group.displayName).toBe('string');
            expect(typeof group.totalAmount).toBe('number');
            expect(typeof group.purchaseCount).toBe('number');
            expect(Array.isArray(group.purchases)).toBe(true);
        });
    });
});
