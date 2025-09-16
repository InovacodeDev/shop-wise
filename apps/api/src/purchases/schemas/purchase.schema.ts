import { PurchaseItemDocument } from '@/purchase-items/schemas/purchase-item.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'purchases', timestamps: false, _id: false })
export class PurchaseDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true, unique: true })
    accessKey: string;

    @Prop({ type: String, required: true, unique: false })
    familyId: string;

    @Prop({ type: String, required: true })
    purchasedBy: string;

    @Prop({ type: String })
    storeId?: string;

    @Prop({ type: String })
    storeName?: string;

    @Prop()
    date?: Date;

    @Prop()
    totalAmount?: number;

    @Prop()
    discount?: number;

    @Prop({
        type: String,
        enum: ['iFood', '99', 'store', 'marketplace', 'online_store'],
        default: 'store',
    })
    purchaseType?: 'iFood' | '99' | 'store' | 'marketplace' | 'online_store';

    @Prop({ type: [PurchaseItemDocument], default: [] })
    items?: PurchaseItemDocument[];
}

export const PurchaseSchema = SchemaFactory.createForClass(PurchaseDocument);

// Configure _id field to use UUID strings
PurchaseSchema.add({ _id: { type: String, required: true } });
