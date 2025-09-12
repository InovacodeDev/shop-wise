import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'goal_deposits', timestamps: true, _id: false })
export class GoalDepositDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    goalId: string;

    @Prop({ type: Number, required: true, min: 0 })
    amount: number;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: Date, required: true })
    depositDate: Date;

    @Prop({ type: String })
    source?: string;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const GoalDepositSchema = SchemaFactory.createForClass(GoalDepositDocument);

// Configure _id field to use UUID strings
GoalDepositSchema.add({ _id: { type: String, required: true } });
