import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentPollingStatusDocument = PaymentPollingStatus & Document;

@Schema({
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'payment_polling_status',
})
export class PaymentPollingStatus {
    @Prop({ type: String, default: () => new Types.ObjectId().toString() })
    _id: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'PolarTransaction', index: true })
    transaction_id: Types.ObjectId;

    @Prop({ type: Date, index: true })
    last_polled_at?: Date;

    @Prop({ type: Boolean, default: true, index: true })
    polling_active: boolean;

    @Prop({ type: Number, default: 0 })
    retry_count: number;

    @Prop({ type: Number, default: 5 })
    max_retries: number;

    @Prop({ type: Date })
    next_poll_at?: Date;

    @Prop({ type: Number, default: 30000 }) // 30 seconds default
    poll_interval_ms: number;

    @Prop({ type: String })
    last_error?: string;

    @Prop({ type: Date })
    stopped_at?: Date;

    @Prop({ type: String })
    stop_reason?: string;

    @Prop({ type: Date })
    created_at: Date;

    @Prop({ type: Date })
    updated_at: Date;
}

export const PaymentPollingStatusSchema = SchemaFactory.createForClass(PaymentPollingStatus);
