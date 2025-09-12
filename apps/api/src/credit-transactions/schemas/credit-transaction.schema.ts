import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'credit_transactions', timestamps: true, _id: false })
export class CreditTransactionDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    cardId: string;

    @Prop({ type: String, required: true })
    expenseId: string;

    @Prop({ type: Number, required: true, min: 0 })
    amount: number;

    @Prop({ type: String, required: true })
    description: string;

    @Prop({ type: Date, required: true })
    transactionDate: Date;

    @Prop({ type: Date, required: true })
    dueDate: Date;

    @Prop({ type: Boolean, default: false })
    isPaid: boolean;

    @Prop({ type: Date })
    paidDate?: Date;

    @Prop({ type: Number, min: 1 })
    installmentNumber?: number;

    @Prop({ type: Number, min: 1 })
    totalInstallments?: number;

    @Prop({ type: Number, min: 0 })
    monthlyAmount?: number;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const CreditTransactionSchema = SchemaFactory.createForClass(CreditTransactionDocument);

// Configure _id field to use UUID strings
CreditTransactionSchema.add({ _id: { type: String, required: true } });
