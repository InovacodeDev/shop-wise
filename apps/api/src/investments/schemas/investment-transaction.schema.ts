import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'investment_transactions', timestamps: true, _id: false })
export class InvestmentTransactionDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    investmentId: string;

    @Prop({
        type: String,
        required: true,
        enum: ['buy', 'sell', 'dividend', 'interest', 'bonus'],
    })
    type: string;

    @Prop({ type: Number, required: true })
    quantity: number;

    @Prop({ type: Number, required: true, min: 0 })
    price: number;

    @Prop({ type: Number, required: true })
    totalValue: number;

    @Prop({ type: Date, required: true })
    date: Date;

    @Prop({ type: Number, min: 0 })
    fees?: number;

    @Prop({ type: String })
    notes?: string;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const InvestmentTransactionSchema = SchemaFactory.createForClass(InvestmentTransactionDocument);

// Configure _id field to use UUID strings
InvestmentTransactionSchema.add({ _id: { type: String, required: true } });
