import { BaseModel, ID } from './common';

export interface Goal extends BaseModel {
    userId: ID; // user._id
    name: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date;
    priority: GoalPriority;
    category?: string; // e.g., 'vacation', 'emergency', 'car', 'house'
    isCompleted: boolean;
    completedDate?: Date;
    color?: string;
    iconName?: string;
}

export interface GoalDeposit extends BaseModel {
    userId: ID; // user._id
    goalId: ID; // goal._id
    amount: number;
    description?: string;
    depositDate: Date;
    source?: string; // e.g., 'salary', 'bonus', 'savings'
}

export type GoalPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface GoalSummary {
    goalId: ID;
    name: string;
    targetAmount: number;
    currentAmount: number;
    progressPercentage: number;
    remainingAmount: number;
    daysRemaining: number;
    isCompleted: boolean;
    priority: GoalPriority;
    category?: string;
}

export interface GoalProgress {
    goalId: ID;
    goalName: string;
    deposits: Array<{
        depositId: ID;
        amount: number;
        description?: string;
        depositDate: Date;
        source?: string;
    }>;
    totalDeposits: number;
    averageDeposit: number;
    lastDepositDate?: Date;
}
