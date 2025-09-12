import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from '../models/user';
import { UuidUtil } from '../utils/uuid.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { UserDocument } from './schemas/user.schema';

type LeanUser = Omit<UserDocument, 'save' | 'toObject' | 'id'> & { _id?: any };

@Injectable()
export class UsersService {
    constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

    async create(createUserDto: CreateUserDto, uid: string) {
        UuidUtil.validateUuid(uid);
        const now = new Date();
        const doc: Partial<User> = { _id: uid, ...createUserDto, createdAt: now, updatedAt: now };
        await this.userModel.updateOne({ _id: uid }, { $set: doc }, { upsert: true }).exec();
        return (await this.userModel.findOne({ _id: uid }).lean<LeanUser>().exec()) as unknown as User;
    }

    async findAll() {
        return (await this.userModel.find({}).lean<LeanUser>().exec()) as unknown as User[];
    }

    async findOne(id: string) {
        UuidUtil.validateUuid(id);
        const doc = (await this.userModel.findOne({ _id: id }).lean<LeanUser>().exec()) as unknown as User | null;
        if (!doc) throw new NotFoundException(`User with ID "${id}" not found`);
        return doc;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        UuidUtil.validateUuid(id);
        const doc = await this.userModel.findOne({ _id: id }).exec();
        if (!doc) throw new NotFoundException(`User with ID "${id}" not found`);
        Object.assign(doc, updateUserDto, { updatedAt: new Date() });
        await doc.save();
        return (await this.userModel.findOne({ _id: id }).lean<LeanUser>().exec()) as unknown as User;
    }

    async remove(id: string) {
        UuidUtil.validateUuid(id);
        const doc = (await this.userModel.findOne({ _id: id }).lean<LeanUser>().exec()) as unknown as User | null;
        if (!doc) throw new NotFoundException(`User with ID "${id}" not found`);
        await this.userModel.deleteOne({ _id: id }).exec();
        return doc;
    }
}
