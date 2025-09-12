import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'plans', timestamps: true, _id: false })
export class PlanDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    description: string;

    @Prop({ type: Number, required: true, min: 0 })
    price: number;

    @Prop({ type: String, required: true, default: 'BRL' })
    currency: string;

    @Prop({
        type: String,
        required: true,
        enum: ['monthly', 'yearly'],
    })
    interval: string;

    @Prop({ type: [Object], required: true })
    features: Array<{
        name: string;
        description: string;
        code: string;
        isEnabled: boolean;
    }>;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: Number, min: 1 })
    maxUsers?: number;

    @Prop({ type: Number, min: 0, default: 0 })
    trialDays?: number;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const PlanSchema = SchemaFactory.createForClass(PlanDocument);

// Configure _id field to use UUID strings
PlanSchema.add({ _id: { type: String, required: true } });
