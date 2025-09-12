/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';

import { PurchaseItemsService } from '../src/purchase-items/purchase-items.service';

describe('PurchaseItemsService', () => {
    let service: PurchaseItemsService;

    const store = new Map<string, Record<string, unknown>>();
    let resolveLastPurchasesUpdate: ((v?: any) => void) | null = null;
    const waitForLastPurchasesUpdate = () =>
        new Promise((resolve) => {
            resolveLastPurchasesUpdate = resolve;
        });

    const fakeCollection = {
        findOne: jest.fn((query: { _id?: string }) => {
            if (query._id) return store.get(query._id) ?? null;
            return null;
        }),
        updateOne: jest.fn((q: { _id: string; 'items.productId'?: string } | any, payload: any) => {
            const id = q._id;
            const existing = (store.get(id) as Record<string, any>) ?? { items: [] };
            // handle $set and $push used by the service
            const set = payload.$set ?? {};
            const push = payload.$push ?? {};
            let items: any[] = (existing.items as any[]) ?? [];
            if (push.items) {
                items = items.concat(push.items as any[]);
            }

            // support updating nested item lastPurchases via 'items.$.lastPurchases'
            if (set && set['items.$.lastPurchases'] && q['items.productId']) {
                const productId = q['items.productId'];
                items = items.map((it: any) => {
                    if (String(it.productId) === String(productId)) {
                        return { ...it, lastPurchases: set['items.$.lastPurchases'] };
                    }
                    return it;
                });
            }

            store.set(id, { ...existing, ...set, items });

            // notify any waiter that lastPurchases was updated
            if (set && set['items.$.lastPurchases'] && resolveLastPurchasesUpdate) {
                resolveLastPurchasesUpdate(set['items.$.lastPurchases']);
                resolveLastPurchasesUpdate = null;
            }

            return { matchedCount: 1 };
        }),
        find: jest.fn((query: any) => {
            // return a chainable object with sort/limit/select/lean/exec
            const results = Array.from(store.values()).filter((v: any) => {
                if (v.familyId !== query.familyId) return false;
                const productId = query['items.productId'];
                return (v.items || []).some((it: any) => String(it.productId) === String(productId));
            });
            return {
                sort: () => ({ limit: () => ({ select: () => ({ lean: () => ({ exec: () => results }) }) }) }),
            } as any;
        }),
    };

    const fakeModel = {
        findOne: jest.fn((query: any) => {
            const result = fakeCollection.findOne(query);
            return {
                lean: () => ({ exec: () => result }),
                exec: () => result,
            };
        }),
        updateOne: jest.fn((q: any, payload: any) => ({ exec: () => fakeCollection.updateOne(q, payload) })),
        find: jest.fn((q: any) => fakeCollection.find(q)),
        exists: jest.fn(() => ({ exec: () => false })),
        create: jest.fn((doc: any) => ({ exec: () => doc })),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PurchaseItemsService,
                // Nest's @InjectModel('Purchase') resolves to the token 'PurchaseModel' in tests
                { provide: 'PurchaseModel', useValue: fakeModel },
                // Nest's @InjectModel('Product') resolves to the token 'ProductModel' in tests
                { provide: 'ProductModel', useValue: fakeModel },
            ],
        }).compile();

        service = module.get<PurchaseItemsService>(PurchaseItemsService);
    });

    it('creates and retrieves purchase items', async () => {
        const familyId = randomUUID();
        const purchaseId = randomUUID();
        // seed purchase
        store.set(purchaseId, { _id: purchaseId, familyId, items: [] });

        const created = await service.create(familyId, purchaseId, { productId: 'p1', quantity: 2, price: 1.5 } as any);
        expect(created).toBeDefined();

        const list = await service.findAll(familyId, purchaseId);
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBeGreaterThan(0);
    });

    it('populates lastPurchases asynchronously on create', async () => {
        const familyId = randomUUID();
        const purchaseId = randomUUID();

        // seed previous purchases containing product 'p1'
        const earlier1 = randomUUID();
        const earlier2 = randomUUID();
        const date1 = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10);
        const date2 = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5);

        store.set(earlier1, {
            _id: earlier1,
            familyId,
            date: date1,
            storeId: 's1',
            storeName: 'S1',
            items: [{ productId: 'p1', price: 2, quantity: 1 }],
        });
        store.set(earlier2, {
            _id: earlier2,
            familyId,
            date: date2,
            storeId: 's1',
            storeName: 'S1',
            items: [{ productId: 'p1', price: 3, quantity: 2 }],
        });

        // seed current purchase
        store.set(purchaseId, { _id: purchaseId, familyId, items: [] });

        const createPromise = service.create(familyId, purchaseId, { productId: 'p1', quantity: 1, price: 4 } as any);

        // wait for background population to trigger
        const last = await waitForLastPurchasesUpdate();
        expect(Array.isArray(last)).toBe(true);
        // check that the purchase document was updated in our fake store
        const current = store.get(purchaseId) as any;
        expect(current.items[0].lastPurchases).toBeDefined();
        expect(current.items[0].lastPurchases.length).toBeGreaterThanOrEqual(1);
        await createPromise;
    });

    it('populates lastPurchases asynchronously on bulkUpdate', async () => {
        const familyId = randomUUID();
        const purchaseId = randomUUID();

        // seed previous purchases for product 'px'
        const earlier = randomUUID();
        const date1 = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3);
        store.set(earlier, {
            _id: earlier,
            familyId,
            date: date1,
            storeId: 's2',
            storeName: 'S2',
            items: [{ productId: 'px', price: 5, quantity: 1 }],
        });

        // current purchase has an existing item with barcode 'b1'
        const existingItem = { productId: 'px', barcode: 'b1', name: 'Prod X', quantity: 1, price: 5, total: 5 };
        store.set(purchaseId, { _id: purchaseId, familyId, items: [existingItem] });

        // perform bulkUpdate with an updated item (same barcode)
        await service.bulkUpdate(familyId, purchaseId, [
            { barcode: 'b1', name: 'Prod X', quantity: 2, price: 6 } as any,
        ]);

        // wait for background population
        const last = await waitForLastPurchasesUpdate();
        expect(Array.isArray(last)).toBe(true);
        const current = store.get(purchaseId) as any;
        const found = (current.items || []).find((it: any) => it.barcode === 'b1');
        expect(found).toBeDefined();
        expect(found.lastPurchases).toBeDefined();
        expect(found.lastPurchases.length).toBeGreaterThanOrEqual(1);
    });
});
