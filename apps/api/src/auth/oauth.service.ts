// Minimal helper to upsert user from external OAuth tokens. In production validate provider tokens.
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import { UserDocument } from '../users/schemas/user.schema';

type UserRecord = {
    _id: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    createdAt?: Date;
    updatedAt?: Date;
    [k: string]: unknown;
};

@Injectable()
export class OauthService {
    constructor(@InjectModel('User') private readonly userModel: Model<UserDocument>) {}

    async upsertUser(profile: { email?: string; displayName?: string; photoURL?: string }): Promise<UserRecord | null> {
        const uid = profile.email ? `oauth:${profile.email}` : randomUUID();
        const now = new Date();
        const doc: Partial<UserRecord> = {
            _id: uid,
            email: profile.email,
            displayName: profile.displayName,
            photoURL: profile.photoURL,
            updatedAt: now,
            createdAt: now,
        };
        await this.userModel.updateOne({ _id: uid }, { $set: doc }, { upsert: true }).exec();
        return (await this.userModel.findOne({ _id: uid }).lean().exec()) as unknown as UserRecord | null;
    }
}
