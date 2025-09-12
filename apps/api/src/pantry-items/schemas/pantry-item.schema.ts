import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'pantry_items', timestamps: false, _id: false })
export class PantryItemDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true })
    familyId: string;

    @Prop()
    productId?: string;

    @Prop()
    productName?: string;

    @Prop({ type: String })
    addedBy?: string;

    @Prop()
    quantity?: number;

    @Prop()
    unit?: string;

    @Prop()
    lastUpdatedAt?: Date;
}

export const PantryItemSchema = SchemaFactory.createForClass(PantryItemDocument);

// Configure _id field to use UUID strings
PantryItemSchema.add({ _id: { type: String, required: true } });
