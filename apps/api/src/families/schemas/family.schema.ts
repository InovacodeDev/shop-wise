import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'families', timestamps: false, _id: false })
export class FamilyDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true, unique: true })
    ownerId: string;

    @Prop()
    familyName: string;

    @Prop()
    plan?: 'free' | 'premium' | 'pro';

    @Prop({ required: false, default: null, type: Date })
    planExpiresAt?: Date;

    @Prop({ type: [Object] })
    familyComposition: Record<string, number>;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const FamilySchema = SchemaFactory.createForClass(FamilyDocument);

// Configure _id field to use UUID strings
FamilySchema.add({ _id: { type: String, required: true } });
