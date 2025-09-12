import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PolarTransactionDocument = PolarTransaction & Document;

export enum PolarTransactionStatus {
    OPEN = 'open',
    COMPLETED = 'completed',
    FAILED = 'failed',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled',
}

@Schema({
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'polar_transactions',
})
export class PolarTransaction {
    @Prop({ type: String, default: () => new Types.ObjectId().toString() })
    _id: string;

    @Prop({ required: true, unique: true, index: true })
    polar_checkout_id: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
    user_id: Types.ObjectId;

    @Prop({ required: true, type: Number })
    amount: number;

    @Prop({ required: true, type: String })
    currency: string;

    @Prop({
        required: true,
        type: String,
        enum: Object.values(PolarTransactionStatus),
        default: PolarTransactionStatus.OPEN,
        index: true,
    })
    status: PolarTransactionStatus;

    @Prop({ type: String })
    product_id?: string;

    @Prop({ type: String })
    product_price_id?: string;

    @Prop({ type: String })
    discount_id?: string;

    @Prop({ type: String })
    customer_id?: string;

    @Prop({ type: String })
    customer_email?: string;

    @Prop({ type: String })
    checkout_url?: string;

    @Prop({ type: String })
    success_url?: string;

    @Prop({ type: Object, default: {} })
    metadata: Record<string, any>;

    @Prop({ type: Object })
    polar_checkout_data?: Record<string, any>;

    @Prop({ type: Object })
    billing_address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    };

    @Prop({ type: Date })
    expires_at?: Date;

    @Prop({ type: Date })
    completed_at?: Date;

    @Prop({ type: Date })
    created_at: Date;

    @Prop({ type: Date })
    updated_at: Date;
}

export const PolarTransactionSchema = SchemaFactory.createForClass(PolarTransaction);
