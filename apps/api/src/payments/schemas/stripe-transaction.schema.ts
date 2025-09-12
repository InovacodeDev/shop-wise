import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StripeTransactionDocument = StripeTransaction & Document;

@Schema({ timestamps: true })
export class StripeTransaction {
    @Prop({ required: true, unique: true })
    stripeTransactionId: string;

    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    familyId: string;

    @Prop({ required: true })
    type: 'checkout_session' | 'payment_intent' | 'subscription';

    @Prop({ required: true })
    status: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    currency: string;

    @Prop()
    customerId?: string;

    @Prop()
    customerEmail?: string;

    @Prop()
    paymentMethodId?: string;

    @Prop()
    productId?: string;

    @Prop()
    priceId?: string;

    @Prop({ type: Object })
    metadata?: Record<string, any>;

    @Prop({ type: Object })
    billingAddress?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };

    @Prop()
    subscriptionId?: string;

    @Prop()
    invoiceId?: string;

    @Prop()
    chargeId?: string;

    @Prop()
    receiptUrl?: string;

    @Prop()
    checkoutSessionUrl?: string;

    @Prop()
    clientSecret?: string;

    @Prop()
    lastError?: string;

    @Prop()
    refundedAmount?: number;

    @Prop()
    refundedAt?: Date;

    @Prop()
    canceledAt?: Date;

    @Prop()
    completedAt?: Date;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;
}

export const StripeTransactionSchema = SchemaFactory.createForClass(StripeTransaction);
