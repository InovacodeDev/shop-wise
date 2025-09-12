import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { randomUUID } from 'node:crypto';

import { CategoriesService } from '../../src/categories/categories.service';
import { CreateCategoryDto } from '../../src/categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../../src/categories/dto/update-category.dto';
import { CategoryDocument, CategorySchema } from '../../src/categories/schemas/category.schema';

jest.setTimeout(20000);

describe('CategoriesService Integration Tests', () => {
    let mongod: MongoMemoryServer;
    let mongooseConn: typeof mongoose;
    let categoriesService: CategoriesService;
    let CategoryModel: Model<CategoryDocument>;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        mongooseConn = await mongoose.connect(uri, { dbName: 'test' });

        CategoryModel = mongooseConn.model<CategoryDocument>('Category', CategorySchema);
        categoriesService = new CategoriesService(CategoryModel);
    });

    afterAll(async () => {
        if (mongooseConn) await mongooseConn.disconnect();
        if (mongod) await mongod.stop();
    });

    beforeEach(async () => {
        await CategoryModel.deleteMany({});
    });

    describe('create', () => {
        it('should create a category with UUID _id', async () => {
            const createDto: CreateCategoryDto = {
                names: { en: 'Test Category' },
                colorLight: '#FF0000',
                colorDark: '#AA0000',
                iconName: 'test-icon',
            };

            const created = await categoriesService.create(createDto);

            expect(created).toBeDefined();
            expect(created._id).toBeDefined();
            expect(typeof created._id).toBe('string');
            expect(created.names).toEqual(createDto.names);
            expect(created.colorLight).toBe(createDto.colorLight);

            // Verify the document was stored in MongoDB with UUID as _id
            const doc = await CategoryModel.findById(created._id).exec();
            expect(doc).toBeDefined();
            expect(doc!._id).toBe(created._id);
        });
    });

    describe('findOne', () => {
        let testCategoryId: string;

        beforeEach(async () => {
            const createDto: CreateCategoryDto = {
                names: { en: 'Test Category' },
                colorLight: '#FF0000',
                colorDark: '#AA0000',
                iconName: 'test-icon',
            };
            const created = await categoriesService.create(createDto);
            testCategoryId = created._id;
        });

        it('should find a category with valid UUID', async () => {
            const found = await categoriesService.findOne(testCategoryId);

            expect(found).toBeDefined();
            expect(found._id).toBe(testCategoryId);
            expect(found.names.en).toBe('Test Category');
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
                await expect(categoriesService.findOne(invalidId)).rejects.toThrow(BadRequestException);
                await expect(categoriesService.findOne(invalidId)).rejects.toThrow(`Invalid UUID format: ${invalidId}`);
            }
        });

        it('should throw BadRequestException for null/undefined ID', async () => {
            await expect(categoriesService.findOne('')).rejects.toThrow(BadRequestException);
            await expect(categoriesService.findOne('')).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException for valid UUID that does not exist', async () => {
            const nonExistentId = randomUUID();

            await expect(categoriesService.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
            await expect(categoriesService.findOne(nonExistentId)).rejects.toThrow(
                `Category with ID "${nonExistentId}" not found`,
            );
        });

        it('should work with different valid UUID formats', async () => {
            const v1Uuid = '550e8400-e29b-41d4-a716-446655440000';

            const categoryDoc = new CategoryModel({
                _id: v1Uuid,
                names: { en: 'V1 UUID Category' },
                colorLight: '#FF0000',
                colorDark: '#AA0000',
                iconName: 'test-icon',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await categoryDoc.save();

            const found = await categoriesService.findOne(v1Uuid);
            expect(found).toBeDefined();
            expect(found._id).toBe(v1Uuid);
        });
    });

    describe('update', () => {
        let testCategoryId: string;

        beforeEach(async () => {
            const createDto: CreateCategoryDto = {
                names: { en: 'Test Category' },
                colorLight: '#FF0000',
                colorDark: '#AA0000',
                iconName: 'test-icon',
            };
            const created = await categoriesService.create(createDto);
            testCategoryId = created._id;
        });

        it('should update a category with valid UUID', async () => {
            const updateDto: UpdateCategoryDto = {
                names: { en: 'Updated Category Name' },
                colorLight: '#00FF00',
            };

            const updated = await categoriesService.update(testCategoryId, updateDto);

            expect(updated).toBeDefined();
            expect(updated._id).toBe(testCategoryId);
            expect(updated.names.en).toBe(updateDto.names!.en);
            expect(updated.colorLight).toBe(updateDto.colorLight);

            const doc = await CategoryModel.findById(testCategoryId).exec();
            expect(doc!.names.en).toBe(updateDto.names!.en);
            expect(doc!.colorLight).toBe(updateDto.colorLight);
        });

        it('should throw BadRequestException for invalid UUID format', async () => {
            const updateDto: UpdateCategoryDto = { names: { en: 'Updated Name' } };
            const invalidId = 'invalid-uuid';

            await expect(categoriesService.update(invalidId, updateDto)).rejects.toThrow(BadRequestException);
            await expect(categoriesService.update(invalidId, updateDto)).rejects.toThrow(
                `Invalid UUID format: ${invalidId}`,
            );
        });

        it('should throw NotFoundException for valid UUID that does not exist', async () => {
            const nonExistentId = randomUUID();
            const updateDto: UpdateCategoryDto = { names: { en: 'Updated Name' } };

            await expect(categoriesService.update(nonExistentId, updateDto)).rejects.toThrow(NotFoundException);
            await expect(categoriesService.update(nonExistentId, updateDto)).rejects.toThrow(
                `Category with ID "${nonExistentId}" not found`,
            );
        });
    });

    describe('remove', () => {
        let testCategoryId: string;

        beforeEach(async () => {
            const createDto: CreateCategoryDto = {
                names: { en: 'Test Category' },
                colorLight: '#FF0000',
                colorDark: '#AA0000',
                iconName: 'test-icon',
            };
            const created = await categoriesService.create(createDto);
            testCategoryId = created._id;
        });

        it('should remove a category with valid UUID', async () => {
            const removed = await categoriesService.remove(testCategoryId);

            expect(removed).toBeDefined();
            expect(removed._id).toBe(testCategoryId);
            expect(removed.names.en).toBe('Test Category');

            const doc = await CategoryModel.findById(testCategoryId).exec();
            expect(doc).toBeNull();
        });

        it('should throw BadRequestException for invalid UUID format', async () => {
            const invalidId = 'invalid-uuid';

            await expect(categoriesService.remove(invalidId)).rejects.toThrow(BadRequestException);
            await expect(categoriesService.remove(invalidId)).rejects.toThrow(`Invalid UUID format: ${invalidId}`);
        });

        it('should throw NotFoundException for valid UUID that does not exist', async () => {
            const nonExistentId = randomUUID();

            await expect(categoriesService.remove(nonExistentId)).rejects.toThrow(NotFoundException);
            await expect(categoriesService.remove(nonExistentId)).rejects.toThrow(
                `Category with ID "${nonExistentId}" not found`,
            );
        });
    });

    describe('UUID as MongoDB _id field', () => {
        it('should store and retrieve UUID strings as _id without BSONError', async () => {
            const customUuid = randomUUID();

            const categoryDoc = new CategoryModel({
                _id: customUuid,
                names: { en: 'Custom UUID Category' },
                colorLight: '#FF0000',
                colorDark: '#AA0000',
                iconName: 'test-icon',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await expect(categoryDoc.save()).resolves.toBeDefined();

            const found = await CategoryModel.findById(customUuid).exec();
            expect(found).toBeDefined();
            expect(found!._id).toBe(customUuid);
            expect(typeof found!._id).toBe('string');

            const serviceResult = await categoriesService.findOne(customUuid);
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
                const categoryDoc = new CategoryModel({
                    _id: uuid,
                    names: { en: `Category ${uuid}` },
                    colorLight: '#FF0000',
                    colorDark: '#AA0000',
                    iconName: 'test-icon',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                await expect(categoryDoc.save()).resolves.toBeDefined();

                const found = await CategoryModel.findById(uuid).exec();
                expect(found).toBeDefined();
                expect(found!._id).toBe(uuid);
            }
        });

        it('should perform MongoDB operations without BSONError', async () => {
            const uuid = randomUUID();

            const categoryDoc = new CategoryModel({
                _id: uuid,
                names: { en: 'Test Category' },
                colorLight: '#FF0000',
                colorDark: '#AA0000',
                iconName: 'test-icon',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await categoryDoc.save();

            await expect(CategoryModel.findById(uuid).exec()).resolves.toBeDefined();
            await expect(CategoryModel.findOne({ _id: uuid }).exec()).resolves.toBeDefined();
            await expect(
                CategoryModel.findByIdAndUpdate(uuid, { names: { en: 'Updated Category' } }, { new: true }).exec(),
            ).resolves.toBeDefined();
            await expect(CategoryModel.findByIdAndDelete(uuid).exec()).resolves.toBeDefined();
        });
    });

    describe('findAll', () => {
        it('should return all categories with UUID _id fields', async () => {
            const categories = await Promise.all([
                categoriesService.create({
                    names: { en: 'Category 1' },
                    colorLight: '#FF0000',
                    colorDark: '#AA0000',
                    iconName: 'icon1',
                }),
                categoriesService.create({
                    names: { en: 'Category 2' },
                    colorLight: '#00FF00',
                    colorDark: '#00AA00',
                    iconName: 'icon2',
                }),
                categoriesService.create({
                    names: { en: 'Category 3' },
                    colorLight: '#0000FF',
                    colorDark: '#0000AA',
                    iconName: 'icon3',
                }),
            ]);

            const allCategories = await categoriesService.findAll();

            expect(allCategories).toHaveLength(3);

            // Sort both arrays by category name to ensure consistent comparison
            const sortedAllCategories = allCategories.sort((a, b) => a.names.en.localeCompare(b.names.en));
            const sortedCreatedCategories = categories.sort((a, b) => a.names.en.localeCompare(b.names.en));

            sortedAllCategories.forEach((category, index) => {
                expect(category._id).toBeDefined();
                expect(typeof category._id).toBe('string');
                expect(category._id).toBe(sortedCreatedCategories[index]._id);
                expect(category.names.en).toBe(`Category ${index + 1}`);
            });
        });

        it('should return empty array when no categories exist', async () => {
            const allCategories = await categoriesService.findAll();
            expect(allCategories).toEqual([]);
        });
    });
});
