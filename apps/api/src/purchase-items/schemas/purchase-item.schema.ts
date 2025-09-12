import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class PurchaseItemDocument extends Document<string> {
    @Prop({ type: String, required: true })
    productId: string;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true, default: 0 })
    price: number;

    @Prop({ required: true, default: 0 })
    total: number;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: String })
    barcode?: string;

    @Prop({ type: String })
    brand?: string;

    @Prop({ type: String, required: true })
    category: string;

    @Prop({ type: String })
    subCategory?: string;

    @Prop({ type: String, required: true })
    unit: 'kg' | 'l' | 'un';

    @Prop({
        type: [
            {
                date: Date,
                price: Number,
                quantity: Number,
                storeId: String,
                storeName: String,
                purchaseId: String,
            },
        ],
        default: [],
    })
    lastPurchases?: Array<{
        date?: Date;
        price?: number;
        quantity?: number;
        storeId?: string;
        storeName?: string;
        purchaseId?: string;
    }>;
}

export const PurchaseItemSchema = SchemaFactory.createForClass(PurchaseItemDocument);
