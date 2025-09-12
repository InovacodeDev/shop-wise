import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'goals', timestamps: true, _id: false })
export class GoalDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: Number, required: true, min: 0 })
    targetAmount: number;

    @Prop({ type: Number, required: true, default: 0, min: 0 })
    currentAmount: number;

    @Prop({ type: Date, required: true })
    targetDate: Date;

    @Prop({
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    })
    priority: string;

    @Prop({ type: String })
    category?: string;

    @Prop({ type: Boolean, default: false })
    isCompleted: boolean;

    @Prop({ type: Date })
    completedDate?: Date;

    @Prop({ type: String })
    color?: string;

    @Prop({ type: String })
    iconName?: string;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const GoalSchema = SchemaFactory.createForClass(GoalDocument);

// Configure _id field to use UUID strings
GoalSchema.add({ _id: { type: String, required: true } });
