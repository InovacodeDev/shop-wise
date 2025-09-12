import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserDocument } from '../users/schemas/user.schema';
import { AuthenticatedRequest } from './authenticated-request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(@InjectModel('User') private readonly userModel: Model<UserDocument>) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: AuthenticatedRequest = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split('Bearer ')[1];

        if (!token) return false;

        // For migration: we expect the token to be the user's uid (or a lookup key).
        const user = await this.userModel.findOne({ uid: token }).lean().exec();
        if (!user) return false;

        request.user = { ...user, uid: user._id };
        return true;
    }
}
