import { BaseModel, ID } from './common';

export interface Account extends BaseModel {
    userId: ID; // user._id
    name: string;
    currentBalance: number;
    type: AccountType;
    institution?: string; // bank name for bank accounts
    accountNumber?: string; // masked account number
    isActive: boolean;
    color?: string; // for UI display
    iconName?: string; // for UI display
}

export type AccountType =
    | 'checking' // conta corrente
    | 'savings' // conta poupança
    | 'wallet' // carteira física
    | 'investment' // conta investimento
    | 'credit_card' // cartão de crédito (saldo negativo)
    | 'other';

export interface AccountSummary {
    totalBalance: number;
    accountsCount: number;
    accountsByType: Record<AccountType, number>; // total balance by type
    recentTransactions: Array<{
        accountId: ID;
        accountName: string;
        type: 'credit' | 'debit';
        amount: number;
        description: string;
        date: Date;
    }>;
}
