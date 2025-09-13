import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from '../models/user';
import { UuidUtil } from '../utils/uuid.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { UserDocument } from './schemas/user.schema';

type LeanUser = Omit<UserDocument, 'save' | 'toObject' | 'id'> & { _id?: any };
type SanitizedUser = Omit<
    User,
    | 'passwordHash'
    | 'totpSecret'
    | 'totpTempSecret'
    | 'refreshTokenHash'
    | 'emailVerificationTokenHash'
    | 'emailVerificationTokenHmacPrefix'
    | 'passwordResetTokenHash'
    | 'passwordResetTokenHmacPrefix'
> & {
    email?: string; // email is optional depending on access rights
};

@Injectable()
export class UsersService {
    constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

    /**
     * Remove sensitive fields from user data before returning
     */
    private sanitizeUser(user: User, requestingUserId?: string): SanitizedUser {
        // Fields to exclude from response
        const sensitiveFields = [
            'passwordHash',
            'totpSecret',
            'totpTempSecret',
            'refreshTokenHash',
            'emailVerificationTokenHash',
            'emailVerificationTokenHmacPrefix',
            'passwordResetTokenHash',
            'passwordResetTokenHmacPrefix',
        ];

        const sanitizedUser = { ...user };

        // Remove sensitive fields
        sensitiveFields.forEach((field) => {
            delete sanitizedUser[field];
        });

        // Include email only if it's the user's own data
        if (!requestingUserId || user._id !== requestingUserId) {
            delete sanitizedUser.email;
        }

        return sanitizedUser;
    }

    async create(createUserDto: CreateUserDto, uid: string) {
        UuidUtil.validateUuid(uid);
        const now = new Date();
        const doc: Partial<User> = { _id: uid, ...createUserDto, createdAt: now, updatedAt: now };
        await this.userModel.updateOne({ _id: uid }, { $set: doc }, { upsert: true }).exec();
        const createdUser = (await this.userModel.findOne({ _id: uid }).lean<LeanUser>().exec()) as unknown as User;
        return this.sanitizeUser(createdUser, uid); // User can see their own data including email
    }

    async findAll(requestingUserId?: string) {
        const users = (await this.userModel.find({}).lean<LeanUser>().exec()) as unknown as User[];
        return users.map((user) => this.sanitizeUser(user, requestingUserId));
    }

    async findOne(id: string, requestingUserId?: string) {
        UuidUtil.validateUuid(id);
        const doc = (await this.userModel.findOne({ _id: id }).lean<LeanUser>().exec()) as unknown as User | null;
        if (!doc) throw new NotFoundException(`User with ID "${id}" not found`);
        return this.sanitizeUser(doc, requestingUserId);
    }

    async update(id: string, updateUserDto: UpdateUserDto, requestingUserId?: string) {
        UuidUtil.validateUuid(id);

        // Check if user exists first
        const existingUser = await this.userModel.findOne({ _id: id }).lean<LeanUser>().exec();
        if (!existingUser) throw new NotFoundException(`User with ID "${id}" not found`);

        // Use updateOne to only send modified fields
        const updateData = { ...updateUserDto, updatedAt: new Date() };
        await this.userModel.updateOne({ _id: id }, { $set: updateData }).exec();

        // Return updated user
        const updatedUser = (await this.userModel.findOne({ _id: id }).lean<LeanUser>().exec()) as unknown as User;
        return this.sanitizeUser(updatedUser, requestingUserId);
    }

    async remove(id: string, requestingUserId?: string) {
        UuidUtil.validateUuid(id);
        const doc = (await this.userModel.findOne({ _id: id }).lean<LeanUser>().exec()) as unknown as User | null;
        if (!doc) throw new NotFoundException(`User with ID "${id}" not found`);
        await this.userModel.deleteOne({ _id: id }).exec();
        return this.sanitizeUser(doc, requestingUserId);
    }
}
