import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'accounts', timestamps: true, _id: false })
export class AccountDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: Number, required: true, default: 0 })
    currentBalance: number;

    @Prop({
        type: String,
        required: true,
        enum: ['checking', 'savings', 'wallet', 'investment', 'credit_card', 'other'],
    })
    type: string;

    @Prop({ type: String })
    institution?: string;

    @Prop({ type: String })
    accountNumber?: string;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: String })
    color?: string;

    @Prop({ type: String })
    iconName?: string;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(AccountDocument);

// Configure _id field to use UUID strings
AccountSchema.add({ _id: { type: String, required: true } });
