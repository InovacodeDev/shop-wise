import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'products', timestamps: false, _id: false })
export class ProductDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String })
    name: string;

    @Prop({ type: String, required: true, unique: true })
    barcode: string;

    @Prop()
    description?: string;

    @Prop()
    brand?: string;

    @Prop({ required: true })
    category: string;

    @Prop()
    subCategory?: string;

    @Prop({ required: true })
    unit: string;
}

export const ProductSchema = SchemaFactory.createForClass(ProductDocument);

// Configure _id field to use UUID strings
ProductSchema.add({ _id: { type: String, required: true } });
