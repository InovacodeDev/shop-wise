import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'expenses', timestamps: true, _id: false })
export class ExpenseDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    categoryId: string;

    @Prop({ type: Number, required: true, min: 0 })
    amount: number;

    @Prop({ type: Date, required: true })
    date: Date;

    @Prop({
        type: String,
        required: true,
        enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'other'],
    })
    paymentMethod: string;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: String })
    accountId?: string;

    @Prop({ type: [String] })
    tags?: string[];

    @Prop({ type: Boolean, default: false })
    isRecurring?: boolean;

    @Prop({ type: String })
    recurringId?: string;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(ExpenseDocument);

// Configure _id field to use UUID strings
ExpenseSchema.add({ _id: { type: String, required: true } });
