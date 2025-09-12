import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'investments', timestamps: true, _id: false })
export class InvestmentDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({
        type: String,
        required: true,
        enum: ['stocks', 'bonds', 'funds', 'crypto', 'real_estate', 'other'],
    })
    type: string;

    @Prop({ type: String, required: true })
    asset: string;

    @Prop({ type: Number, required: true, min: 0 })
    quantity: number;

    @Prop({ type: Number, required: true, min: 0 })
    averagePrice: number;

    @Prop({ type: Number, required: true, min: 0 })
    totalInvested: number;

    @Prop({ type: Number, min: 0 })
    currentPrice?: number;

    @Prop({ type: Number, min: 0 })
    currentValue?: number;

    @Prop({ type: Number })
    profitability?: number;

    @Prop({ type: Number })
    profitabilityPercent?: number;

    @Prop({ type: Date })
    lastUpdated?: Date;

    @Prop({ type: String })
    broker?: string;

    @Prop({ type: String })
    notes?: string;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const InvestmentSchema = SchemaFactory.createForClass(InvestmentDocument);

// Configure _id field to use UUID strings
InvestmentSchema.add({ _id: { type: String, required: true } });
