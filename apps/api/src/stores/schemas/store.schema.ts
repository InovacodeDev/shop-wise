import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'stores', timestamps: false, _id: false })
export class StoreDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String })
    name: string;

    @Prop({ type: String, unique: true, required: true })
    cnpj: string;

    @Prop({ type: String })
    address?: string;

    @Prop({ type: String })
    phone?: string;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

// Schema para preferências de estabelecimento por família
@Schema({ collection: 'store_preferences', timestamps: true })
export class StorePreferenceDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true, index: true })
    familyId: string;

    @Prop({ type: String, required: true, index: true })
    storeId: string;

    @Prop({ type: String, enum: ['favorite', 'ignored', 'neutral'], default: 'neutral' })
    preference: 'favorite' | 'ignored' | 'neutral';

    @Prop({ type: Date, default: Date.now })
    lastPurchaseDate?: Date;

    @Prop({ type: Number, default: 0 })
    purchaseCount: number;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const StoreSchema = SchemaFactory.createForClass(StoreDocument);
export const StorePreferenceSchema = SchemaFactory.createForClass(StorePreferenceDocument);

// Configure _id field to use UUID strings
StoreSchema.add({ _id: { type: String, required: true } });
StorePreferenceSchema.add({ _id: { type: String, required: true } });

// Ensure unique combination of familyId + storeId
StorePreferenceSchema.index({ familyId: 1, storeId: 1 }, { unique: true });
