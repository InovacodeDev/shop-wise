import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'users', timestamps: false, _id: false })
export class UserDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true, unique: true })
    email: string;

    @Prop()
    displayName?: string;

    @Prop()
    photoURL?: string;

    @Prop({ type: String })
    familyId?: string;

    @Prop({ type: [Object] })
    settings?: Record<string, any>;

    // auth-related fields
    @Prop()
    passwordHash?: string;

    @Prop()
    totpEnabled?: boolean;

    @Prop()
    totpSecret?: string;

    @Prop()
    totpTempSecret?: string;

    @Prop()
    refreshTokenHash?: string;

    @Prop()
    emailVerified?: boolean;

    @Prop()
    // store only hashed tokens (do not store raw tokens)
    emailVerificationTokenHash?: string;

    @Prop()
    // short, indexable prefix of HMAC(emailVerificationToken) for quick lookup
    emailVerificationTokenHmacPrefix?: string;

    @Prop()
    emailVerificationTokenExpiresAt?: Date;

    @Prop()
    passwordResetTokenHash?: string;

    @Prop()
    // short, indexable prefix of HMAC(passwordResetToken) for quick lookup
    passwordResetTokenHmacPrefix?: string;

    @Prop()
    passwordResetExpiresAt?: Date;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

// Configure _id field to use UUID strings
UserSchema.add({ _id: { type: String, required: true } });

// Index the HMAC prefix fields to speed token lookups
UserSchema.index({ emailVerificationTokenHmacPrefix: 1 });
UserSchema.index({ passwordResetTokenHmacPrefix: 1 });
