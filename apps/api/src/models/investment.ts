import { BaseModel, ID } from './common';

export interface Investment extends BaseModel {
    userId: ID; // user._id
    name: string; // nome do investimento (ex: "Tesouro Selic 2025")
    type: InvestmentType; // tipo de investimento
    asset: string; // código do ativo (ex: "LFT", "PETR4", "BTC")
    quantity: number; // quantidade investida
    averagePrice: number; // preço médio de compra
    totalInvested: number; // total investido (quantity * averagePrice)
    currentPrice?: number; // preço atual do ativo
    currentValue?: number; // valor atual (quantity * currentPrice)
    profitability?: number; // rentabilidade em reais
    profitabilityPercent?: number; // rentabilidade percentual
    lastUpdated?: Date; // última atualização do preço
    broker?: string; // corretora utilizada
    notes?: string; // observações
    isActive: boolean; // se o investimento ainda está ativo
}

export interface InvestmentTransaction extends BaseModel {
    userId: ID; // user._id
    investmentId: ID; // investment._id
    type: TransactionType; // compra, venda, dividendo, juros
    quantity: number; // quantidade da transação
    price: number; // preço por unidade
    totalValue: number; // valor total da transação
    date: Date; // data da transação
    fees?: number; // taxas cobradas
    notes?: string; // observações
}

export type InvestmentType =
    | 'stocks' // ações
    | 'bonds' // títulos públicos/privados
    | 'funds' // fundos de investimento
    | 'crypto' // criptomoedas
    | 'real_estate' // imóveis
    | 'other'; // outros

export type TransactionType =
    | 'buy' // compra
    | 'sell' // venda
    | 'dividend' // dividendo
    | 'interest' // juros
    | 'bonus'; // bonificação

export interface InvestmentSummary {
    totalInvested: number;
    currentValue: number;
    totalProfitability: number;
    totalProfitabilityPercent: number;
    investmentsByType: Record<
        InvestmentType,
        {
            count: number;
            invested: number;
            currentValue: number;
            profitability: number;
        }
    >;
    topPerformers: Array<{
        investmentId: ID;
        name: string;
        profitabilityPercent: number;
        profitability: number;
    }>;
    recentTransactions: Array<{
        investmentName: string;
        type: TransactionType;
        amount: number;
        date: Date;
    }>;
}

export interface InvestmentPortfolio {
    userId: ID;
    summary: InvestmentSummary;
    investments: Investment[];
    monthlyEvolution: Array<{
        month: string;
        totalValue: number;
        totalInvested: number;
    }>;
}
