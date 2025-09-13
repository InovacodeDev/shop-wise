import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { randomUUID } from 'node:crypto';

import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';
import { UserDocument, UserSchema } from '../../src/users/schemas/user.schema';
import { UsersService } from '../../src/users/users.service';

jest.setTimeout(20000);

describe('UsersService Integration Tests', () => {
    let mongod: MongoMemoryServer;
    let mongooseConn: typeof mongoose;
    let usersService: UsersService;
    let UserModel: Model<UserDocument>;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        mongooseConn = await mongoose.connect(uri, { dbName: 'test' });

        UserModel = mongooseConn.model<UserDocument>('User', UserSchema);
        usersService = new UsersService(UserModel);
    });

    afterAll(async () => {
        if (mongooseConn) await mongooseConn.disconnect();
        if (mongod) await mongod.stop();
    });

    beforeEach(async () => {
        await UserModel.deleteMany({});
    });

    describe('create', () => {
        it('should create a user with UUID _id', async () => {
            const userId = randomUUID();
            const createDto: CreateUserDto = {
                email: 'test@example.com',
                displayName: 'Test User',
            };

            const created = await usersService.create(createDto, userId);

            expect(created).toBeDefined();
            expect(created._id).toBeDefined();
            expect(typeof created._id).toBe('string');
            expect(created.email).toBe(createDto.email);
            expect(created.displayName).toBe(createDto.displayName);

            // Verify the document was stored in MongoDB with UUID as _id
            const doc = await UserModel.findById(created._id).exec();
            expect(doc).toBeDefined();
            expect(doc!._id).toBe(created._id);
        });
    });

    describe('findOne', () => {
        let testUserId: string;

        beforeEach(async () => {
            testUserId = randomUUID();
            const createDto: CreateUserDto = {
                email: 'test@example.com',
                displayName: 'Test User',
            };
            const created = await usersService.create(createDto, testUserId);
            testUserId = created._id;
        });

        it('should find a user with valid UUID', async () => {
            // When no requesting user ID is provided, email should not be included
            const found = await usersService.findOne(testUserId);

            expect(found).toBeDefined();
            expect(found._id).toBe(testUserId);
            expect(found.email).toBeUndefined(); // Email should be sanitized
            expect(found.displayName).toBe('Test User');
        });

        it('should find a user with email when user requests their own data', async () => {
            // When requesting user's own data, email should be included
            const found = await usersService.findOne(testUserId, testUserId);

            expect(found).toBeDefined();
            expect(found._id).toBe(testUserId);
            expect(found.email).toBe('test@example.com'); // Email should be included for own data
            expect(found.displayName).toBe('Test User');
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
                await expect(usersService.findOne(invalidId)).rejects.toThrow(BadRequestException);
                await expect(usersService.findOne(invalidId)).rejects.toThrow(`Invalid UUID format: ${invalidId}`);
            }
        });

        it('should throw BadRequestException for null/undefined ID', async () => {
            await expect(usersService.findOne('')).rejects.toThrow(BadRequestException);
            await expect(usersService.findOne('')).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException for valid UUID that does not exist', async () => {
            const nonExistentId = randomUUID();

            await expect(usersService.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
            await expect(usersService.findOne(nonExistentId)).rejects.toThrow(
                `User with ID "${nonExistentId}" not found`,
            );
        });

        it('should work with different valid UUID formats', async () => {
            const v1Uuid = '550e8400-e29b-41d4-a716-446655440000';

            const userDoc = new UserModel({
                _id: v1Uuid,
                email: 'v1uuid@example.com',
                displayName: 'V1 User',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await userDoc.save();

            const found = await usersService.findOne(v1Uuid);
            expect(found).toBeDefined();
            expect(found._id).toBe(v1Uuid);
        });
    });

    describe('update', () => {
        let testUserId: string;

        beforeEach(async () => {
            testUserId = randomUUID();
            const createDto: CreateUserDto = {
                email: 'test@example.com',
                displayName: 'Test User',
            };
            const created = await usersService.create(createDto, testUserId);
            testUserId = created._id;
        });

        it('should update a user with valid UUID', async () => {
            const updateDto: UpdateUserDto = {
                displayName: 'Updated User',
            };

            const updated = await usersService.update(testUserId, updateDto);

            expect(updated).toBeDefined();
            expect(updated._id).toBe(testUserId);
            expect(updated.displayName).toBe(updateDto.displayName);

            const doc = await UserModel.findById(testUserId).exec();
            expect(doc!.displayName).toBe(updateDto.displayName);
        });

        it('should throw BadRequestException for invalid UUID format', async () => {
            const updateDto: UpdateUserDto = { displayName: 'Updated' };
            const invalidId = 'invalid-uuid';

            await expect(usersService.update(invalidId, updateDto)).rejects.toThrow(BadRequestException);
            await expect(usersService.update(invalidId, updateDto)).rejects.toThrow(
                `Invalid UUID format: ${invalidId}`,
            );
        });

        it('should throw NotFoundException for valid UUID that does not exist', async () => {
            const nonExistentId = randomUUID();
            const updateDto: UpdateUserDto = { displayName: 'Updated' };

            await expect(usersService.update(nonExistentId, updateDto)).rejects.toThrow(NotFoundException);
            await expect(usersService.update(nonExistentId, updateDto)).rejects.toThrow(
                `User with ID "${nonExistentId}" not found`,
            );
        });
    });

    describe('remove', () => {
        let testUserId: string;

        beforeEach(async () => {
            testUserId = randomUUID();
            const createDto: CreateUserDto = {
                email: 'test@example.com',
                displayName: 'Test User',
            };
            const created = await usersService.create(createDto, testUserId);
            testUserId = created._id;
        });

        it('should remove a user with valid UUID', async () => {
            // When no requesting user ID is provided, email should not be included
            const removed = await usersService.remove(testUserId);

            expect(removed).toBeDefined();
            expect(removed._id).toBe(testUserId);
            expect(removed.email).toBeUndefined(); // Email should be sanitized

            const doc = await UserModel.findById(testUserId).exec();
            expect(doc).toBeNull();
        });

        it('should remove a user and include email when user removes their own data', async () => {
            // Create another user to test removal with own data access
            const anotherUserId = randomUUID();
            const createDto: CreateUserDto = {
                email: 'another@example.com',
                displayName: 'Another User',
            };
            await usersService.create(createDto, anotherUserId);

            // When requesting user removes their own data, email should be included
            const removed = await usersService.remove(anotherUserId, anotherUserId);

            expect(removed).toBeDefined();
            expect(removed._id).toBe(anotherUserId);
            expect(removed.email).toBe('another@example.com'); // Email should be included for own data

            const doc = await UserModel.findById(anotherUserId).exec();
            expect(doc).toBeNull();
        });

        it('should throw BadRequestException for invalid UUID format', async () => {
            const invalidId = 'invalid-uuid';

            await expect(usersService.remove(invalidId)).rejects.toThrow(BadRequestException);
            await expect(usersService.remove(invalidId)).rejects.toThrow(`Invalid UUID format: ${invalidId}`);
        });

        it('should throw NotFoundException for valid UUID that does not exist', async () => {
            const nonExistentId = randomUUID();

            await expect(usersService.remove(nonExistentId)).rejects.toThrow(NotFoundException);
            await expect(usersService.remove(nonExistentId)).rejects.toThrow(
                `User with ID "${nonExistentId}" not found`,
            );
        });
    });

    describe('UUID as MongoDB _id field', () => {
        it('should store and retrieve UUID strings as _id without BSONError', async () => {
            const customUuid = randomUUID();

            const userDoc = new UserModel({
                _id: customUuid,
                email: 'custom@example.com',
                displayName: 'Custom User',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await expect(userDoc.save()).resolves.toBeDefined();

            const found = await UserModel.findById(customUuid).exec();
            expect(found).toBeDefined();
            expect(found!._id).toBe(customUuid);
            expect(typeof found!._id).toBe('string');

            const serviceResult = await usersService.findOne(customUuid);
            expect(serviceResult._id).toBe(customUuid);
        });

        it('should handle multiple UUID formats without BSONError', async () => {
            const uuids = [
                randomUUID(),
                '550e8400-e29b-41d4-a716-446655440000',
                '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
            ];

            for (const [index, uuid] of uuids.entries()) {
                const userDoc = new UserModel({
                    _id: uuid,
                    email: `user${index}@example.com`,
                    displayName: 'Test User',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                await expect(userDoc.save()).resolves.toBeDefined();

                const found = await UserModel.findById(uuid).exec();
                expect(found).toBeDefined();
                expect(found!._id).toBe(uuid);
            }
        });

        it('should perform MongoDB operations without BSONError', async () => {
            const uuid = randomUUID();

            const userDoc = new UserModel({
                _id: uuid,
                email: 'test@example.com',
                displayName: 'Test User',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await userDoc.save();

            await expect(UserModel.findById(uuid).exec()).resolves.toBeDefined();
            await expect(UserModel.findOne({ _id: uuid }).exec()).resolves.toBeDefined();
            await expect(
                UserModel.findByIdAndUpdate(uuid, { displayName: 'Updated' }, { new: true }).exec(),
            ).resolves.toBeDefined();
            await expect(UserModel.findByIdAndDelete(uuid).exec()).resolves.toBeDefined();
        });
    });

    describe('findAll', () => {
        it('should return all users with UUID _id fields', async () => {
            const users = await Promise.all([
                usersService.create(
                    {
                        email: 'user1@example.com',
                        displayName: 'User 1',
                    },
                    randomUUID(),
                ),
                usersService.create(
                    {
                        email: 'user2@example.com',
                        displayName: 'User 2',
                    },
                    randomUUID(),
                ),
                usersService.create(
                    {
                        email: 'user3@example.com',
                        displayName: 'User 3',
                    },
                    randomUUID(),
                ),
            ]);

            const allUsers = await usersService.findAll();

            expect(allUsers).toHaveLength(3);

            // Sort both arrays by displayName to ensure consistent comparison
            const sortedAllUsers = allUsers.sort((a, b) => a.displayName?.localeCompare(b.displayName ?? '') ?? 0);
            const sortedCreatedUsers = users.sort((a, b) => a.displayName?.localeCompare(b.displayName ?? '') ?? 0);

            sortedAllUsers.forEach((user, index) => {
                expect(user._id).toBeDefined();
                expect(typeof user._id).toBe('string');
                expect(user._id).toBe(sortedCreatedUsers[index]._id);
                expect(user.displayName).toBe(`User ${index + 1}`);
            });
        });

        it('should return empty array when no users exist', async () => {
            const allUsers = await usersService.findAll();
            expect(allUsers).toEqual([]);
        });
    });
});
