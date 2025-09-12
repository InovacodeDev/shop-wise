import { BaseModel, ID } from './common';

export interface CreditCard extends BaseModel {
    userId: ID; // user._id
    name: string;
    lastFourDigits: string;
    cardType: CardType;
    creditLimit: number;
    currentBalance: number;
    availableLimit: number;
    dueDay: number; // dia do mês do vencimento
    closingDay: number; // dia do mês do fechamento
    isActive: boolean;
    color?: string;
    iconName?: string;
}

export type CardType = 'visa' | 'mastercard' | 'amex' | 'elo' | 'other';

export interface CreditCardSummary {
    totalCards: number;
    totalCreditLimit: number;
    totalUsedLimit: number;
    totalAvailableLimit: number;
    cardsByType: Record<CardType, number>;
    upcomingPayments: Array<{
        cardId: ID;
        cardName: string;
        amount: number;
        dueDate: Date;
    }>;
}
