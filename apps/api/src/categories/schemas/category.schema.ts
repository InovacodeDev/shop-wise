import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'categories', timestamps: false, _id: false })
export class CategoryDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: Object })
    names: Record<string, string>;

    @Prop()
    colorLight: string;

    @Prop()
    colorDark: string;

    @Prop()
    iconName: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(CategoryDocument);

// Configure _id field to use UUID strings
CategorySchema.add({ _id: { type: String, required: true } });
