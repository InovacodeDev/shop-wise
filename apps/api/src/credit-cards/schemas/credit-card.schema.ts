import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'credit_cards', timestamps: true, _id: false })
export class CreditCardDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true, minlength: 4, maxlength: 4 })
    lastFourDigits: string;

    @Prop({
        type: String,
        required: true,
        enum: ['visa', 'mastercard', 'amex', 'elo', 'other'],
    })
    cardType: string;

    @Prop({ type: Number, required: true, min: 0 })
    creditLimit: number;

    @Prop({ type: Number, required: true, default: 0 })
    currentBalance: number;

    @Prop({ type: Number, required: true, min: 0 })
    availableLimit: number;

    @Prop({ type: Number, required: true, min: 1, max: 31 })
    dueDay: number;

    @Prop({ type: Number, required: true, min: 1, max: 31 })
    closingDay: number;

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

export const CreditCardSchema = SchemaFactory.createForClass(CreditCardDocument);

// Configure _id field to use UUID strings
CreditCardSchema.add({ _id: { type: String, required: true } });
