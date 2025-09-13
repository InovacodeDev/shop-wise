import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'shopping_lists', timestamps: false, _id: false })
export class ShoppingListDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true })
    familyId: string;

    @Prop({ type: String, required: true })
    createdBy: string;

    @Prop()
    name?: string;

    @Prop({ type: [Object], default: [] })
    items?: any[];

    @Prop({ type: String, enum: ['active', 'created', 'completed', 'archived'], default: 'active' })
    status?: string;
}

export const ShoppingListSchema = SchemaFactory.createForClass(ShoppingListDocument);

// Configure _id field to use UUID strings
ShoppingListSchema.add({ _id: { type: String, required: true } });
