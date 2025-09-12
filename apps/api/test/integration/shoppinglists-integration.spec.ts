import { randomUUID } from 'crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { PurchaseSchema } from '../../src/purchases/schemas/purchase.schema';
import { ShoppingListStatus } from '../../src/shopping-lists/dto/create-shopping-list.dto';
import { ShoppingListSchema } from '../../src/shopping-lists/schemas/shopping-list.schema';
import { ShoppingListsService } from '../../src/shopping-lists/shopping-lists.service';

jest.setTimeout(20000);

describe('Shopping lists integration (in-memory)', () => {
    let mongod: MongoMemoryServer;
    let mongooseConn: typeof mongoose;
    let shoppingService: ShoppingListsService;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        mongooseConn = await mongoose.connect(uri + 'test');
        const ShoppingModel = mongooseConn.model(
            'ShoppingList',
            ShoppingListSchema,
        ) as unknown as import('mongoose').Model<
            import('../../src/shopping-lists/schemas/shopping-list.schema').ShoppingListDocument
        >;
        // Minimal mock AiService used by ShoppingListsService
        const mockAiService = {
            generateShoppingList: jest.fn(() => ({ listName: 'AI List', items: [] })),
        } as unknown as import('../../src/ai/ai.service').AiService;

        // Create a typed Purchase model for constructor (not used in these basic tests)
        const PurchaseModel = mongooseConn.model<
            import('../../src/purchases/schemas/purchase.schema').PurchaseDocument
        >('Purchase', PurchaseSchema);

        shoppingService = new ShoppingListsService(ShoppingModel, PurchaseModel, mockAiService);
    });

    afterAll(async () => {
        if (mongooseConn) await mongooseConn.disconnect();

        if (mongod) await mongod.stop();
    });

    it('creates and queries a shopping list', async () => {
        const familyId = randomUUID();
        const userId = randomUUID();
        const created = await shoppingService.create(
            familyId,
            { name: 'Weekly', status: ShoppingListStatus.ACTIVE },
            userId,
        );
        expect(created).toBeDefined();

        const all = await shoppingService.findAll(familyId);
        expect(all.length).toBeGreaterThan(0);

        const item = all[0];
        const fetched = await shoppingService.findOne(familyId, item._id);
        expect(fetched._id).toBeDefined();
    });
});
