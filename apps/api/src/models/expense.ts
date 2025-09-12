import { BaseModel, ID } from './common';

export interface Expense extends BaseModel {
    userId: ID; // user._id
    categoryId: ID; // category._id
    amount: number;
    date: Date;
    paymentMethod: PaymentMethod;
    description?: string;
    accountId?: ID; // account._id - optional, for balance tracking
    tags?: string[];
    isRecurring?: boolean;
    recurringId?: ID; // if this expense is part of a recurring transaction
}

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'other';

export interface ExpenseSummary {
    totalAmount: number;
    expensesCount: number;
    categoryBreakdown: Array<{
        categoryId: ID;
        categoryName: string;
        totalAmount: number;
        percentage: number;
    }>;
    monthlyTrend: Array<{
        month: string;
        totalAmount: number;
    }>;
}
