/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { randomUUID } from 'node:crypto';

import { CreatePurchaseDto } from '../../src/purchases/dto/create-purchase.dto';
import { PurchasesService } from '../../src/purchases/purchases.service';
import { PurchaseDocument, PurchaseSchema } from '../../src/purchases/schemas/purchase.schema';

jest.setTimeout(20000);

const mockCacheService: any = {
    cache: new Map(),
    get: jest.fn((familyId: string): unknown => {
        return mockCacheService.cache.get(familyId) || null;
    }),
    set: jest.fn((familyId: string, data: any) => {
        mockCacheService.cache.set(familyId, data);
    }),
    invalidate: jest.fn((familyId: string) => {
        mockCacheService.cache.delete(familyId);
    }),
    clear: jest.fn(() => {
        mockCacheService.cache.clear();
    }),
    getStats: jest.fn(),
    isHealthy: jest.fn(),
    cleanup: jest.fn(),
    destroy: jest.fn(),
};

describe('Purchases integration (in-memory)', () => {
    let mongod: MongoMemoryServer;
    let mongooseConn: typeof mongoose;
    let purchasesService: PurchasesService;
    let PurchaseModel: Model<PurchaseDocument>;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        mongooseConn = await mongoose.connect(uri, { dbName: 'test' });

        PurchaseModel = mongooseConn.model<PurchaseDocument>('Purchase', PurchaseSchema);

        // Create a proper mock cache service
        const mockCacheService: any = {
            cache: new Map(),
            get: jest.fn((familyId: string) => {
                return mockCacheService.cache.get(familyId) || null;
            }),
            set: jest.fn((familyId: string, data: any) => {
                mockCacheService.cache.set(familyId, data);
            }),
            invalidate: jest.fn((familyId: string) => {
                mockCacheService.cache.delete(familyId);
            }),
            clear: jest.fn(() => {
                mockCacheService.cache.clear();
            }),
            getStats: jest.fn(),
            isHealthy: jest.fn(),
            cleanup: jest.fn(),
            destroy: jest.fn(),
        };

        const mockExpensesService: any = {
            create: jest.fn((dto: any) => ({ ...dto, _id: randomUUID() })),
        };

        const mockCategoriesService: any = {
            findAll: jest.fn(() => []),
        };

        purchasesService = new PurchasesService(
            PurchaseModel,
            mockCacheService,
            mockExpensesService,
            mockCategoriesService,
        );
    });

    afterAll(async () => {
        if (mongooseConn) await mongooseConn.disconnect();

        if (mongod) await mongod.stop();
    });

    it('creates and queries a purchase', async () => {
        const familyId = randomUUID();
        const userId = randomUUID();
        const dto: CreatePurchaseDto = {
            storeId: 's1',
            storeName: 'My Store',
            date: new Date().toISOString(),
            totalAmount: 123.45,
            discount: 0,
            accessKey: randomUUID(),
        };
        const created = await purchasesService.create(familyId, dto, userId);
        expect(created).toBeDefined();

        const all = await purchasesService.findAll(familyId);
        expect(all.length).toBeGreaterThan(0);

        const item = all[0];
        const fetched = await purchasesService.findOne(familyId, item._id);
        expect(fetched._id).toBeDefined();
    });

    describe('findAllByMonth', () => {
        it('returns empty array for family with no purchases', async () => {
            const familyId = randomUUID();

            const result = await purchasesService.findAllByMonth(familyId);

            expect(result).toEqual([]);
        });

        it('groups purchases by month correctly', async () => {
            const familyId = randomUUID();
            const userId = randomUUID();

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

            await purchasesService.create(familyId, jan2024Purchase, userId);
            await purchasesService.create(familyId, feb2024Purchase, userId);
            await purchasesService.create(familyId, jan2024Purchase2, userId);

            const result = await purchasesService.findAllByMonth(familyId);

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
        });

        it('handles purchases with null dates', async () => {
            const familyId = randomUUID();
            const userId = randomUUID();

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
                date: null as any,
                totalAmount: 50.0,
                discount: 0,
                accessKey: randomUUID(),
            };

            await purchasesService.create(familyId, validPurchase, userId);
            await purchasesService.create(familyId, nullDatePurchase, userId);

            const result = await purchasesService.findAllByMonth(familyId);

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

        it('validates family ID format', async () => {
            const invalidFamilyId = 'invalid-uuid';

            await expect(purchasesService.findAllByMonth(invalidFamilyId)).rejects.toThrow();
        });

        it('sorts purchases within months by date descending', async () => {
            const familyId = randomUUID();
            const userId = randomUUID();

            // Create purchases in same month but different dates
            const earlierPurchase: CreatePurchaseDto = {
                storeId: 's1',
                storeName: 'Store 1',
                date: '2024-01-10T10:00:00.000Z',
                totalAmount: 100.0,
                discount: 0,
                accessKey: randomUUID(),
            };

            const laterPurchase: CreatePurchaseDto = {
                storeId: 's2',
                storeName: 'Store 2',
                date: '2024-01-20T14:30:00.000Z',
                totalAmount: 75.0,
                discount: 0,
                accessKey: randomUUID(),
            };

            await purchasesService.create(familyId, earlierPurchase, userId);
            await purchasesService.create(familyId, laterPurchase, userId);

            const result = await purchasesService.findAllByMonth(familyId);

            expect(result).toHaveLength(1);
            expect(result[0].purchases).toHaveLength(2);

            // Later purchase should come first (descending order)
            expect(new Date(result[0].purchases[0].date!).getTime()).toBeGreaterThan(
                new Date(result[0].purchases[1].date!).getTime(),
            );
        });

        it('calculates monthly summaries correctly', async () => {
            const familyId = randomUUID();
            const userId = randomUUID();

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

            await purchasesService.create(familyId, purchase1, userId);
            await purchasesService.create(familyId, purchase2, userId);

            const result = await purchasesService.findAllByMonth(familyId);

            expect(result).toHaveLength(1);
            expect(result[0].totalAmount).toBe(200.0);
            expect(result[0].purchaseCount).toBe(2);
        });
    });
});
