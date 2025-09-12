import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';

import { StoreDocument, StoreSchema } from '../../src/stores/schemas/store.schema';

jest.setTimeout(20000);

describe('StoresService Integration Tests', () => {
    let mongod: MongoMemoryServer;
    let mongooseConn: typeof mongoose;
    let StoreModel: Model<StoreDocument>;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        mongooseConn = await mongoose.connect(uri, { dbName: 'test' });

        StoreModel = mongooseConn.model<StoreDocument>('Store', StoreSchema);
    });

    afterAll(async () => {
        if (mongooseConn) await mongooseConn.disconnect();
        if (mongod) await mongod.stop();
    });

    beforeEach(async () => {
        // Clear the collection before each test
        await StoreModel.deleteMany({});
    });

    describe('create', () => {
        it('should be a placeholder test for create', () => {
            expect(true).toBe(true);
        });
    });

    describe('findOne', () => {
        it('should be a placeholder test', () => {
            expect(true).toBe(true);
        });
    });

    describe('update', () => {
        it('should be a placeholder test', () => {
            expect(true).toBe(true);
        });
    });

    describe('remove', () => {
        it('should be a placeholder test', () => {
            expect(true).toBe(true);
        });
    });

    describe('UUID as MongoDB _id field', () => {
        it('should be a placeholder test', () => {
            expect(true).toBe(true);
        });
    });

    describe('findAll', () => {
        it('should be a placeholder test', () => {
            expect(true).toBe(true);
        });
    });
});
