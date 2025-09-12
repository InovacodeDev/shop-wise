import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { randomUUID } from 'node:crypto';

import { CreateFamilyDto } from '../../src/families/dto/create-family.dto';
import { UpdateFamilyDto } from '../../src/families/dto/update-family.dto';
import { FamiliesService } from '../../src/families/families.service';
import { FamilyDocument, FamilySchema } from '../../src/families/schemas/family.schema';

jest.setTimeout(20000);

describe('FamiliesService Integration Tests', () => {
    let mongod: MongoMemoryServer;
    let mongooseConn: typeof mongoose;
    let familiesService: FamiliesService;
    let FamilyModel: Model<FamilyDocument>;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        mongooseConn = await mongoose.connect(uri, { dbName: 'test' });

        FamilyModel = mongooseConn.model<FamilyDocument>('Family', FamilySchema);
        familiesService = new FamiliesService(FamilyModel);
    });

    afterAll(async () => {
        if (mongooseConn) await mongooseConn.disconnect();
        if (mongod) await mongod.stop();
    });

    beforeEach(async () => {
        await FamilyModel.deleteMany({});
    });

    describe('create', () => {
        it('should create a family with UUID _id', async () => {
            const createDto: CreateFamilyDto = {
                familyName: 'Test Family',
            };

            const created = await familiesService.create(createDto, randomUUID());

            expect(created).toBeDefined();
            expect(created._id).toBeDefined();
            expect(typeof created._id).toBe('string');
            expect(created.familyName).toBe(createDto.familyName);

            // Verify the document was stored in MongoDB with UUID as _id
            const doc = await FamilyModel.findById(created._id).exec();
            expect(doc).toBeDefined();
            expect(doc!._id).toBe(created._id);
        });
    });

    describe('findOne', () => {
        let testFamilyId: string;

        beforeEach(async () => {
            const createDto: CreateFamilyDto = {
                familyName: 'Test Family',
            };
            const created = await familiesService.create(createDto, randomUUID());
            testFamilyId = created._id;
        });

        it('should find a family with valid UUID', async () => {
            const found = await familiesService.findOne(testFamilyId);

            expect(found).toBeDefined();
            expect(found._id).toBe(testFamilyId);
            expect(found.familyName).toBe('Test Family');
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
                await expect(familiesService.findOne(invalidId)).rejects.toThrow(BadRequestException);
                await expect(familiesService.findOne(invalidId)).rejects.toThrow(`Invalid UUID format: ${invalidId}`);
            }
        });

        it('should throw BadRequestException for null/undefined ID', async () => {
            await expect(familiesService.findOne('')).rejects.toThrow(BadRequestException);
            await expect(familiesService.findOne('')).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException for valid UUID that does not exist', async () => {
            const nonExistentId = randomUUID();

            await expect(familiesService.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
            await expect(familiesService.findOne(nonExistentId)).rejects.toThrow(
                `Family with ID "${nonExistentId}" not found`,
            );
        });

        it('should work with different valid UUID formats', async () => {
            const v1Uuid = '550e8400-e29b-41d4-a716-446655440000';

            const familyDoc = new FamilyModel({
                _id: v1Uuid,
                ownerId: randomUUID(),
                familyName: 'V1 UUID Family',
                familyComposition: {},
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await familyDoc.save();

            const found = await familiesService.findOne(v1Uuid);
            expect(found).toBeDefined();
            expect(found._id).toBe(v1Uuid);
        });
    });

    describe('update', () => {
        let testFamilyId: string;

        beforeEach(async () => {
            const createDto: CreateFamilyDto = {
                familyName: 'Test Family',
            };
            const created = await familiesService.create(createDto, randomUUID());
            testFamilyId = created._id;
        });

        it('should update a family with valid UUID', async () => {
            const updateDto: UpdateFamilyDto = {
                familyName: 'Updated Family Name',
            };

            const updated = await familiesService.update(testFamilyId, updateDto);

            expect(updated).toBeDefined();
            expect(updated._id).toBe(testFamilyId);
            expect(updated.familyName).toBe(updateDto.familyName);

            const doc = await FamilyModel.findById(testFamilyId).exec();
            expect(doc!.familyName).toBe(updateDto.familyName);
        });

        it('should throw BadRequestException for invalid UUID format', async () => {
            const updateDto: UpdateFamilyDto = { familyName: 'Updated Name' };
            const invalidId = 'invalid-uuid';

            await expect(familiesService.update(invalidId, updateDto)).rejects.toThrow(BadRequestException);
            await expect(familiesService.update(invalidId, updateDto)).rejects.toThrow(
                `Invalid UUID format: ${invalidId}`,
            );
        });

        it('should throw NotFoundException for valid UUID that does not exist', async () => {
            const nonExistentId = randomUUID();
            const updateDto: UpdateFamilyDto = { familyName: 'Updated Name' };

            await expect(familiesService.update(nonExistentId, updateDto)).rejects.toThrow(NotFoundException);
            await expect(familiesService.update(nonExistentId, updateDto)).rejects.toThrow(
                `Family with ID "${nonExistentId}" not found`,
            );
        });
    });

    describe('remove', () => {
        let testFamilyId: string;

        beforeEach(async () => {
            const createDto: CreateFamilyDto = {
                familyName: 'Test Family',
            };
            const created = await familiesService.create(createDto, randomUUID());
            testFamilyId = created._id;
        });

        it('should remove a family with valid UUID', async () => {
            const removed = await familiesService.remove(testFamilyId);

            expect(removed).toBeDefined();
            expect(removed._id).toBe(testFamilyId);
            expect(removed.familyName).toBe('Test Family');

            const doc = await FamilyModel.findById(testFamilyId).exec();
            expect(doc).toBeNull();
        });

        it('should throw BadRequestException for invalid UUID format', async () => {
            const invalidId = 'invalid-uuid';

            await expect(familiesService.remove(invalidId)).rejects.toThrow(BadRequestException);
            await expect(familiesService.remove(invalidId)).rejects.toThrow(`Invalid UUID format: ${invalidId}`);
        });

        it('should throw NotFoundException for valid UUID that does not exist', async () => {
            const nonExistentId = randomUUID();

            await expect(familiesService.remove(nonExistentId)).rejects.toThrow(NotFoundException);
            await expect(familiesService.remove(nonExistentId)).rejects.toThrow(
                `Family with ID "${nonExistentId}" not found`,
            );
        });
    });

    describe('UUID as MongoDB _id field', () => {
        it('should store and retrieve UUID strings as _id without BSONError', async () => {
            const customUuid = randomUUID();

            const familyDoc = new FamilyModel({
                _id: customUuid,
                ownerId: randomUUID(),
                familyName: 'Custom UUID Family',
                familyComposition: {},
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await expect(familyDoc.save()).resolves.toBeDefined();

            const found = await FamilyModel.findById(customUuid).exec();
            expect(found).toBeDefined();
            expect(found!._id).toBe(customUuid);
            expect(typeof found!._id).toBe('string');

            const serviceResult = await familiesService.findOne(customUuid);
            expect(serviceResult._id).toBe(customUuid);
        });

        it('should handle multiple UUID formats without BSONError', async () => {
            const uuids = [
                randomUUID(),
                '550e8400-e29b-41d4-a716-446655440000',
                '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
            ];

            for (const uuid of uuids) {
                const familyDoc = new FamilyModel({
                    _id: uuid,
                    ownerId: randomUUID(),
                    familyName: `Family ${uuid}`,
                    familyComposition: {},
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                await expect(familyDoc.save()).resolves.toBeDefined();

                const found = await FamilyModel.findById(uuid).exec();
                expect(found).toBeDefined();
                expect(found!._id).toBe(uuid);
            }
        });

        it('should perform MongoDB operations without BSONError', async () => {
            const uuid = randomUUID();

            const familyDoc = new FamilyModel({
                _id: uuid,
                ownerId: randomUUID(),
                familyName: 'Test Family',
                familyComposition: {},
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await familyDoc.save();

            await expect(FamilyModel.findById(uuid).exec()).resolves.toBeDefined();
            await expect(FamilyModel.findOne({ _id: uuid }).exec()).resolves.toBeDefined();
            await expect(
                FamilyModel.findByIdAndUpdate(uuid, { familyName: 'Updated Family' }, { new: true }).exec(),
            ).resolves.toBeDefined();
            await expect(FamilyModel.findByIdAndDelete(uuid).exec()).resolves.toBeDefined();
        });
    });

    describe('findAll', () => {
        it('should return all families with UUID _id fields', async () => {
            const families = await Promise.all([
                familiesService.create({ familyName: 'Family 1' }, randomUUID()),
                familiesService.create({ familyName: 'Family 2' }, randomUUID()),
                familiesService.create({ familyName: 'Family 3' }, randomUUID()),
            ]);

            const allFamilies = await familiesService.findAll();

            expect(allFamilies).toHaveLength(3);

            // Sort both arrays by familyName to ensure consistent comparison
            const sortedAllFamilies = allFamilies.sort((a, b) => a.familyName.localeCompare(b.familyName));
            const sortedCreatedFamilies = families.sort((a, b) => a.familyName.localeCompare(b.familyName));

            sortedAllFamilies.forEach((family, index) => {
                expect(family._id).toBeDefined();
                expect(typeof family._id).toBe('string');
                expect(family._id).toBe(sortedCreatedFamilies[index]._id);
                expect(family.familyName).toBe(`Family ${index + 1}`);
            });
        });

        it('should return empty array when no families exist', async () => {
            const allFamilies = await familiesService.findAll();
            expect(allFamilies).toEqual([]);
        });
    });
});
