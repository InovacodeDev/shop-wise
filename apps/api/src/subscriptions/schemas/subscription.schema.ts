import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'subscriptions', timestamps: true, _id: false })
export class SubscriptionDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    planId: string;

    @Prop({
        type: String,
        required: true,
        enum: ['active', 'canceled', 'expired', 'trial', 'past_due'],
        default: 'trial',
    })
    status: string;

    @Prop({ type: Date, required: true })
    startDate: Date;

    @Prop({ type: Date })
    endDate?: Date;

    @Prop({ type: Boolean, default: true })
    autoRenew: boolean;

    @Prop({ type: String })
    paymentMethod?: string;

    @Prop({ type: Date })
    lastPaymentDate?: Date;

    @Prop({ type: Date })
    nextPaymentDate?: Date;

    @Prop({ type: Number, required: true, min: 0 })
    amount: number;

    @Prop({ type: String, required: true, default: 'BRL' })
    currency: string;

    @Prop({ type: [String], default: [] })
    features: string[];

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(SubscriptionDocument);

// Configure _id field to use UUID strings
SubscriptionSchema.add({ _id: { type: String, required: true } });
