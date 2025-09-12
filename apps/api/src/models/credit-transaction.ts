import { BaseModel, ID } from './common';

export interface CreditTransaction extends BaseModel {
    userId: ID; // user._id
    cardId: ID; // credit_card._id
    expenseId: ID; // expense._id
    amount: number;
    description: string;
    transactionDate: Date;
    dueDate: Date;
    isPaid: boolean;
    paidDate?: Date;
    installmentNumber?: number; // número da parcela
    totalInstallments?: number; // total de parcelas
    monthlyAmount?: number; // valor da parcela mensal
}

export interface CreditInvoice {
    cardId: ID;
    cardName: string;
    month: string; // YYYY-MM
    totalAmount: number;
    dueDate: Date;
    transactions: Array<{
        transactionId: ID;
        description: string;
        amount: number;
        transactionDate: Date;
        installmentInfo?: string;
    }>;
    isPaid: boolean;
    paidDate?: Date;
}

export interface CreditTransactionSummary {
    totalTransactions: number;
    totalAmount: number;
    paidTransactions: number;
    unpaidTransactions: number;
    upcomingPayments: Array<{
        transactionId: ID;
        cardName: string;
        description: string;
        amount: number;
        dueDate: Date;
    }>;
}
