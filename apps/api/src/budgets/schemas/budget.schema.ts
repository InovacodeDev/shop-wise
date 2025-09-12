import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'budgets', timestamps: true, _id: false })
export class BudgetDocument extends Document<string> {
    @Prop({ type: String, required: true })
    declare _id: string;

    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    categoryId: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: Number, required: true, min: 0 })
    limit: number;

    @Prop({
        type: String,
        required: true,
        enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    })
    period: string;

    @Prop({ type: Date, required: true })
    startDate: Date;

    @Prop({ type: Date, required: true })
    endDate: Date;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: String })
    color?: string;

    @Prop({ type: String })
    iconName?: string;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const BudgetSchema = SchemaFactory.createForClass(BudgetDocument);

// Configure _id field to use UUID strings
BudgetSchema.add({ _id: { type: String, required: true } });
