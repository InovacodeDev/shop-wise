/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { randomUUID } from 'node:crypto';

import { CreatePantryItemDto } from '../../src/pantry-items/dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from '../../src/pantry-items/dto/update-pantry-item.dto';
import { PantryItemsService } from '../../src/pantry-items/pantry-items.service';
import { PantryItemDocument, PantryItemSchema } from '../../src/pantry-items/schemas/pantry-item.schema';

jest.setTimeout(20000);

describe('PantryItemsService Integration Tests', () => {
    let mongod: MongoMemoryServer;
    let mongooseConn: typeof mongoose;
    let pantryItemsService: PantryItemsService;
    let PantryItemModel: Model<PantryItemDocument>;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        mongooseConn = await mongoose.connect(uri, { dbName: 'test' });

        PantryItemModel = mongooseConn.model<PantryItemDocument>('PantryItem', PantryItemSchema);
        pantryItemsService = new PantryItemsService(PantryItemModel);
    });

    afterAll(async () => {
        if (mongooseConn) await mongooseConn.disconnect();
        if (mongod) await mongod.stop();
    });

    beforeEach(async () => {
        await PantryItemModel.deleteMany({});
    });

    describe('create', () => {
        it('should create a pantry item with UUID _id', async () => {
            const familyId = randomUUID();
            const userId = randomUUID();
            const createDto: CreatePantryItemDto = {
                productId: randomUUID(),
                productName: 'Test Product',
                quantity: 5,
                unit: 'un',
            };

            const created = await pantryItemsService.create(familyId, createDto, userId);

            if (!created) {
                throw new Error('Service returned null');
            }
            expect(created).toBeDefined();
            expect(created._id).toBeDefined();
            expect(typeof created._id).toBe('string');
            expect(created.productId).toBe(createDto.productId);
            expect(created.quantity).toBe(createDto.quantity);
            expect(created.familyId).toBe(familyId);

            // Verify the document was stored in MongoDB with UUID as _id
            const doc = await PantryItemModel.findById(created._id).exec();
            expect(doc).toBeDefined();
            expect(doc!._id).toBe(created._id);
        });
    });

    describe('findOne', () => {
        let testPantryItemId: string;
        let testFamilyId: string;

        beforeEach(async () => {
            testFamilyId = randomUUID();
            const createDto: CreatePantryItemDto = {
                productId: randomUUID(),
                productName: 'Test Product',
                quantity: 5,
                unit: 'un',
            };
            const created = await pantryItemsService.create(testFamilyId, createDto, randomUUID());
            if (!created) {
                throw new Error('Service returned null');
            }
            testPantryItemId = created._id;
        });

        it('should find a pantry item with valid UUID', async () => {
            const found = await pantryItemsService.findOne(testFamilyId, testPantryItemId);

            expect(found).toBeDefined();
            expect(found._id).toBe(testPantryItemId);
            expect(found.familyId).toBe(testFamilyId);
        });

        it('should throw BadRequestException for invalid UUID format', async () => {
            const invalidIds = [
                'invalid-uuid',
                '123',
                'not-a-uuid-at-all',
                '550e8400-e29b-41d4-a716',
                '550e8400-e29b-41d4-a716-446655440000-extra',
                '',
            ];

            for (const invalidId of invalidIds) {
                await expect(pantryItemsService.findOne(testFamilyId, invalidId)).rejects.toThrow(BadRequestException);
                await expect(pantryItemsService.findOne(testFamilyId, invalidId)).rejects.toThrow(
                    `Invalid UUID format: ${invalidId}`,
                );
            }
        });

        it('should throw BadRequestException for null/undefined ID', async () => {
            await expect(pantryItemsService.findOne(testFamilyId, null as any)).rejects.toThrow(BadRequestException);
            await expect(pantryItemsService.findOne(testFamilyId, undefined as any)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw NotFoundException for valid UUID that does not exist', async () => {
            const nonExistentId = randomUUID();

            await expect(pantryItemsService.findOne(testFamilyId, nonExistentId)).rejects.toThrow(NotFoundException);
            await expect(pantryItemsService.findOne(testFamilyId, nonExistentId)).rejects.toThrow(
                `Pantry item with ID "${nonExistentId}" not found in family "${testFamilyId}"`,
            );
        });

        it('should work with different valid UUID formats', async () => {
            const v1Uuid = '550e8400-e29b-41d4-a716-446655440000';

            const pantryItemDoc = new PantryItemModel({
                _id: v1Uuid,
                familyId: testFamilyId,
                productId: randomUUID(),
                productName: 'V1 UUID Product',
                quantity: 3,
                unit: 'un',
                addedBy: randomUUID(),
                addedAt: new Date(),
                lastUpdatedAt: new Date(),
            });
            await pantryItemDoc.save();

            const found = await pantryItemsService.findOne(testFamilyId, v1Uuid);
            expect(found).toBeDefined();
            expect(found._id).toBe(v1Uuid);
        });
    });

    describe('update', () => {
        let testPantryItemId: string;
        let testFamilyId: string;

        beforeEach(async () => {
            testFamilyId = randomUUID();
            const createDto: CreatePantryItemDto = {
                productId: randomUUID(),
                productName: 'Test Product',
                quantity: 5,
                unit: 'un',
            };
            const created = await pantryItemsService.create(testFamilyId, createDto, randomUUID());
            if (!created) {
                throw new Error('Service returned null');
            }
            testPantryItemId = created._id;
        });

        it('should update a pantry item with valid UUID', async () => {
            const updateDto: UpdatePantryItemDto = {
                quantity: 10,
            };

            const updated = await pantryItemsService.update(testFamilyId, testPantryItemId, updateDto, randomUUID());
            if (!updated) {
                throw new Error('Service returned null');
            }

            expect(updated).toBeDefined();
            expect(updated._id).toBe(testPantryItemId);
            expect(updated.quantity).toBe(updateDto.quantity);

            const doc = await PantryItemModel.findById(testPantryItemId).exec();
            expect(doc!.quantity).toBe(updateDto.quantity);
        });

        it('should throw BadRequestException for invalid UUID format', async () => {
            const updateDto: UpdatePantryItemDto = { quantity: 10 };
            const invalidId = 'invalid-uuid';

            await expect(pantryItemsService.update(testFamilyId, invalidId, updateDto, randomUUID())).rejects.toThrow(
                BadRequestException,
            );
            await expect(pantryItemsService.update(testFamilyId, invalidId, updateDto, randomUUID())).rejects.toThrow(
                `Invalid UUID format: ${invalidId}`,
            );
        });

        it('should throw NotFoundException for valid UUID that does not exist', async () => {
            const nonExistentId = randomUUID();
            const updateDto: UpdatePantryItemDto = { quantity: 10 };

            await expect(
                pantryItemsService.update(testFamilyId, nonExistentId, updateDto, randomUUID()),
            ).rejects.toThrow(NotFoundException);
            await expect(
                pantryItemsService.update(testFamilyId, nonExistentId, updateDto, randomUUID()),
            ).rejects.toThrow(`Pantry item with ID "${nonExistentId}" not found in family "${testFamilyId}"`);
        });
    });

    describe('remove', () => {
        let testPantryItemId: string;
        let testFamilyId: string;

        beforeEach(async () => {
            testFamilyId = randomUUID();
            const createDto: CreatePantryItemDto = {
                productId: randomUUID(),
                productName: 'Test Product',
                quantity: 5,
                unit: 'un',
            };
            const created = await pantryItemsService.create(testFamilyId, createDto, randomUUID());
            if (!created) {
                throw new Error('Service returned null');
            }
            testPantryItemId = created._id;
        });

        it('should remove a pantry item with valid UUID', async () => {
            const removed = await pantryItemsService.remove(testFamilyId, testPantryItemId);

            expect(removed).toBeDefined();
            expect(removed._id).toBe(testPantryItemId);
            expect(removed.familyId).toBe(testFamilyId);

            const doc = await PantryItemModel.findById(testPantryItemId).exec();
            expect(doc).toBeNull();
        });

        it('should throw BadRequestException for invalid UUID format', async () => {
            const invalidId = 'invalid-uuid';

            await expect(pantryItemsService.remove(testFamilyId, invalidId)).rejects.toThrow(BadRequestException);
            await expect(pantryItemsService.remove(testFamilyId, invalidId)).rejects.toThrow(
                `Invalid UUID format: ${invalidId}`,
            );
        });

        it('should throw NotFoundException for valid UUID that does not exist', async () => {
            const nonExistentId = randomUUID();

            await expect(pantryItemsService.remove(testFamilyId, nonExistentId)).rejects.toThrow(NotFoundException);
            await expect(pantryItemsService.remove(testFamilyId, nonExistentId)).rejects.toThrow(
                `Pantry item with ID "${nonExistentId}" not found in family "${testFamilyId}"`,
            );
        });
    });

    describe('UUID as MongoDB _id field', () => {
        it('should store and retrieve UUID strings as _id without BSONError', async () => {
            const customUuid = randomUUID();
            const familyId = randomUUID();

            const pantryItemDoc = new PantryItemModel({
                _id: customUuid,
                familyId: familyId,
                productId: randomUUID(),
                productName: 'Custom UUID Product',
                quantity: 3,
                unit: 'un',
                addedBy: randomUUID(),
                addedAt: new Date(),
                lastUpdatedAt: new Date(),
            });

            await expect(pantryItemDoc.save()).resolves.toBeDefined();

            const found = await PantryItemModel.findById(customUuid).exec();
            expect(found).toBeDefined();
            expect(found!._id).toBe(customUuid);
            expect(typeof found!._id).toBe('string');

            const serviceResult = await pantryItemsService.findOne(familyId, customUuid);
            expect(serviceResult._id).toBe(customUuid);
        });

        it('should handle multiple UUID formats without BSONError', async () => {
            const familyId = randomUUID();
            const uuids = [
                randomUUID(),
                '550e8400-e29b-41d4-a716-446655440000',
                '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
            ];

            for (const uuid of uuids) {
                const pantryItemDoc = new PantryItemModel({
                    _id: uuid,
                    familyId: familyId,
                    productId: randomUUID(),
                    productName: `Product ${uuid}`,
                    quantity: 3,
                    unit: 'un',
                    addedBy: randomUUID(),
                    addedAt: new Date(),
                    lastUpdatedAt: new Date(),
                });

                await expect(pantryItemDoc.save()).resolves.toBeDefined();

                const found = await PantryItemModel.findById(uuid).exec();
                expect(found).toBeDefined();
                expect(found!._id).toBe(uuid);
            }
        });

        it('should perform MongoDB operations without BSONError', async () => {
            const uuid = randomUUID();
            const familyId = randomUUID();

            const pantryItemDoc = new PantryItemModel({
                _id: uuid,
                familyId: familyId,
                productId: randomUUID(),
                productName: 'Test Product',
                quantity: 3,
                unit: 'un',
                addedBy: randomUUID(),
                addedAt: new Date(),
                lastUpdatedAt: new Date(),
            });
            await pantryItemDoc.save();

            await expect(PantryItemModel.findById(uuid).exec()).resolves.toBeDefined();
            await expect(PantryItemModel.findOne({ _id: uuid }).exec()).resolves.toBeDefined();
            await expect(
                PantryItemModel.findByIdAndUpdate(uuid, { quantity: 10 }, { new: true }).exec(),
            ).resolves.toBeDefined();
            await expect(PantryItemModel.findByIdAndDelete(uuid).exec()).resolves.toBeDefined();
        });
    });

    describe('findAll', () => {
        it('should return all pantry items with UUID _id fields', async () => {
            const familyId = randomUUID();
            const pantryItems = await Promise.all([
                pantryItemsService.create(
                    familyId,
                    {
                        productId: randomUUID(),
                        productName: 'Product 1',
                        quantity: 1,
                        unit: 'un',
                    },
                    randomUUID(),
                ),
                pantryItemsService.create(
                    familyId,
                    {
                        productId: randomUUID(),
                        productName: 'Product 2',
                        quantity: 2,
                        unit: 'un',
                    },
                    randomUUID(),
                ),
                pantryItemsService.create(
                    familyId,
                    {
                        productId: randomUUID(),
                        productName: 'Product 3',
                        quantity: 3,
                        unit: 'un',
                    },
                    randomUUID(),
                ),
            ]);

            const allPantryItems = await pantryItemsService.findAll(familyId);

            expect(allPantryItems).toHaveLength(3);

            // Sort both arrays by quantity to ensure consistent comparison
            const sortedPantryItems = allPantryItems.sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
            const sortedCreatedItems = pantryItems.sort((a, b) => (a?.quantity ?? 0) - (b?.quantity ?? 0));

            sortedPantryItems.forEach((pantryItem, index) => {
                if (!sortedCreatedItems[index]) {
                    throw new Error('Unexpected null or undefined value');
                }
                expect(pantryItem._id).toBeDefined();
                expect(typeof pantryItem._id).toBe('string');
                expect(pantryItem._id).toBe(sortedCreatedItems[index]._id);
                expect(pantryItem.quantity).toBe(index + 1);
            });
        });

        it('should return empty array when no pantry items exist', async () => {
            const familyId = randomUUID();
            const allPantryItems = await pantryItemsService.findAll(familyId);
            expect(allPantryItems).toEqual([]);
        });
    });
});
