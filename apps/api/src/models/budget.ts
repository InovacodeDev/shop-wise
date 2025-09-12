import { BaseModel, ID } from './common';

export interface Budget extends BaseModel {
    userId: ID; // user._id
    categoryId: ID; // category._id
    name: string;
    limit: number;
    period: BudgetPeriod;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    color?: string;
    iconName?: string;
}

export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface BudgetSummary {
    budgetId: ID;
    budgetName: string;
    categoryName: string;
    limit: number;
    spent: number;
    remaining: number;
    percentage: number;
    status: 'on_track' | 'warning' | 'exceeded';
    period: BudgetPeriod;
    daysRemaining: number;
}

export interface BudgetAlert {
    budgetId: ID;
    budgetName: string;
    categoryName: string;
    alertType: 'warning' | 'exceeded';
    currentSpent: number;
    limit: number;
    percentage: number;
    message: string;
}
