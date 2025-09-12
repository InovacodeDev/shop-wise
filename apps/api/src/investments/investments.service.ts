/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ID } from '@/models/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
    Investment,
    InvestmentPortfolio,
    InvestmentSummary,
    InvestmentTransaction,
    InvestmentType,
    TransactionType,
} from '../models/investment';
import {
    mapCreateInvestmentDtoToInvestment,
    mapCreateInvestmentTransactionDtoToInvestmentTransaction,
    mapUpdateInvestmentDtoToPartial,
    mapUpdateInvestmentTransactionDtoToPartial,
} from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreateInvestmentTransactionDto } from './dto/create-investment-transaction.dto';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentTransactionDto } from './dto/update-investment-transaction.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import type { InvestmentTransactionDocument } from './schemas/investment-transaction.schema';
import type { InvestmentDocument } from './schemas/investment.schema';

type LeanInvestment = Omit<InvestmentDocument, 'save' | 'toObject' | 'id'> & { _id?: any };
type LeanInvestmentTransaction = Omit<InvestmentTransactionDocument, 'save' | 'toObject' | 'id'> & { _id?: any };

@Injectable()
export class InvestmentsService {
    constructor(
        @InjectModel('Investment') private investmentModel: Model<InvestmentDocument>,
        @InjectModel('InvestmentTransaction') private investmentTransactionModel: Model<InvestmentTransactionDocument>,
    ) {}

    // Investments CRUD
    async create(createInvestmentDto: CreateInvestmentDto, userId: ID): Promise<Investment> {
        const doc = mapCreateInvestmentDtoToInvestment(createInvestmentDto, userId);
        const created = await this.investmentModel.create(doc as unknown as InvestmentDocument);
        return (await this.investmentModel
            .findById(created._id)
            .lean<LeanInvestment>()
            .exec()) as unknown as Investment;
    }

    async findAll(userId: ID): Promise<Investment[]> {
        return (await this.investmentModel
            .find({ userId, isActive: true })
            .sort({ createdAt: -1 })
            .lean<LeanInvestment>()
            .exec()) as unknown as Investment[];
    }

    async findOne(_id: ID, userId: ID): Promise<Investment> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.investmentModel
            .findOne({ _id, userId })
            .lean<LeanInvestment>()
            .exec()) as unknown as Investment | null;
        if (!doc) throw new NotFoundException(`Investment with ID "${String(_id)}" not found`);
        return doc;
    }

    async update(_id: ID, updateInvestmentDto: UpdateInvestmentDto, userId: ID): Promise<Investment> {
        UuidUtil.validateUuid(_id);
        const existing = await this.investmentModel.findOne({ _id, userId }).exec();
        if (!existing) throw new NotFoundException(`Investment with ID "${String(_id)}" not found`);
        Object.assign(existing, mapUpdateInvestmentDtoToPartial(updateInvestmentDto));
        await existing.save();
        return (await this.investmentModel.findById(_id).lean<LeanInvestment>().exec()) as unknown as Investment;
    }

    async remove(_id: ID, userId: ID): Promise<Investment> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.investmentModel
            .findOne({ _id, userId })
            .lean<LeanInvestment>()
            .exec()) as unknown as Investment | null;
        if (!doc) throw new NotFoundException(`Investment with ID "${String(_id)}" not found`);
        await this.investmentModel.deleteOne({ _id, userId }).exec();
        return doc;
    }

    // Investment Transactions CRUD
    async createTransaction(
        createInvestmentTransactionDto: CreateInvestmentTransactionDto,
        userId: ID,
    ): Promise<InvestmentTransaction> {
        const doc = mapCreateInvestmentTransactionDtoToInvestmentTransaction(createInvestmentTransactionDto, userId);
        const created = await this.investmentTransactionModel.create(doc as unknown as InvestmentTransactionDocument);

        // Update investment based on transaction type
        await this.updateInvestmentFromTransaction(createInvestmentTransactionDto, userId);

        return (await this.investmentTransactionModel
            .findById(created._id)
            .lean<LeanInvestmentTransaction>()
            .exec()) as unknown as InvestmentTransaction;
    }

    async findTransactionsByInvestment(investmentId: ID, userId: ID): Promise<InvestmentTransaction[]> {
        UuidUtil.validateUuid(investmentId);
        return (await this.investmentTransactionModel
            .find({ investmentId, userId })
            .sort({ date: -1 })
            .lean<LeanInvestmentTransaction>()
            .exec()) as unknown as InvestmentTransaction[];
    }

    async updateTransaction(
        _id: ID,
        updateInvestmentTransactionDto: UpdateInvestmentTransactionDto,
        userId: ID,
    ): Promise<InvestmentTransaction> {
        UuidUtil.validateUuid(_id);
        const existing = await this.investmentTransactionModel.findOne({ _id, userId }).exec();
        if (!existing) throw new NotFoundException(`Investment transaction with ID "${String(_id)}" not found`);

        const oldTransaction = { ...existing.toObject() };
        Object.assign(existing, mapUpdateInvestmentTransactionDtoToPartial(updateInvestmentTransactionDto));
        await existing.save();

        // Update investment based on the difference
        await this.updateInvestmentFromTransactionChange(oldTransaction, existing, userId);

        return (await this.investmentTransactionModel
            .findById(_id)
            .lean<LeanInvestmentTransaction>()
            .exec()) as unknown as InvestmentTransaction;
    }

    async removeTransaction(_id: ID, userId: ID): Promise<InvestmentTransaction> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.investmentTransactionModel
            .findOne({ _id, userId })
            .lean<LeanInvestmentTransaction>()
            .exec()) as unknown as InvestmentTransaction | null;
        if (!doc) throw new NotFoundException(`Investment transaction with ID "${String(_id)}" not found`);

        // Reverse the transaction effect on investment
        await this.reverseTransactionEffect(doc, userId);

        await this.investmentTransactionModel.deleteOne({ _id, userId }).exec();
        return doc;
    }

    // Analytics and summaries
    async getPortfolio(userId: ID): Promise<InvestmentPortfolio> {
        const investments = await this.findAll(userId);
        const summary = await this.getInvestmentsSummary(userId);
        const monthlyEvolution = await this.getMonthlyEvolution(userId);

        return {
            userId,
            summary,
            investments,
            monthlyEvolution,
        };
    }

    async getInvestmentsSummary(userId: ID): Promise<InvestmentSummary> {
        const investments = await this.findAll(userId);

        const totalInvested = investments.reduce((sum, inv) => sum + inv.totalInvested, 0);
        const currentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.totalInvested), 0);
        const totalProfitability = currentValue - totalInvested;
        const totalProfitabilityPercent = totalInvested > 0 ? (totalProfitability / totalInvested) * 100 : 0;

        // Group by type
        const investmentsByType = investments.reduce(
            (acc, inv) => {
                if (!acc[inv.type]) {
                    acc[inv.type] = { count: 0, invested: 0, currentValue: 0, profitability: 0 };
                }
                acc[inv.type].count++;
                acc[inv.type].invested += inv.totalInvested;
                acc[inv.type].currentValue += inv.currentValue || inv.totalInvested;
                acc[inv.type].profitability += inv.profitability || 0;
                return acc;
            },
            {} as Record<
                InvestmentType,
                { count: number; invested: number; currentValue: number; profitability: number }
            >,
        );

        // Top performers
        const topPerformers = investments
            .filter((inv) => inv.profitabilityPercent !== undefined)
            .sort((a, b) => (b.profitabilityPercent || 0) - (a.profitabilityPercent || 0))
            .slice(0, 5)
            .map((inv) => ({
                investmentId: inv._id,
                name: inv.name,
                profitabilityPercent: inv.profitabilityPercent || 0,
                profitability: inv.profitability || 0,
            }));

        // Recent transactions
        const recentTransactions = await this.getRecentTransactions(userId, 10);

        return {
            totalInvested,
            currentValue,
            totalProfitability,
            totalProfitabilityPercent,
            investmentsByType,
            topPerformers,
            recentTransactions,
        };
    }

    async updatePrices(userId: ID, prices: Record<string, number>): Promise<void> {
        const investments = await this.findAll(userId);

        for (const investment of investments) {
            if (prices[investment.asset]) {
                const currentPrice = prices[investment.asset];
                const currentValue = investment.quantity * currentPrice;
                const profitability = currentValue - investment.totalInvested;
                const profitabilityPercent = (profitability / investment.totalInvested) * 100;

                await this.investmentModel.findByIdAndUpdate(investment._id, {
                    currentPrice,
                    currentValue,
                    profitability,
                    profitabilityPercent,
                    lastUpdated: new Date(),
                });
            }
        }
    }

    // Private helper methods
    private async updateInvestmentFromTransaction(dto: CreateInvestmentTransactionDto, userId: ID): Promise<void> {
        const investment = await this.investmentModel.findOne({ _id: dto.investmentId, userId }).exec();
        if (!investment) return;

        // Update average price and quantity
        const newTotalInvested = investment.totalInvested + dto.quantity * dto.price;
        const newQuantity = investment.quantity + dto.quantity;
        const newAveragePrice = newTotalInvested / newQuantity;

        switch (dto.type) {
            case 'buy':
                investment.quantity = newQuantity;
                investment.averagePrice = newAveragePrice;
                investment.totalInvested = newTotalInvested;

                // Recalculate current value and profitability
                if (investment.currentPrice) {
                    investment.currentValue = newQuantity * investment.currentPrice;
                    investment.profitability = investment.currentValue - newTotalInvested;
                    investment.profitabilityPercent = (investment.profitability / newTotalInvested) * 100;
                }
                break;
            case 'sell':
                // Reduce quantity
                investment.quantity -= dto.quantity;
                // If quantity becomes 0, mark as inactive
                if (investment.quantity <= 0) {
                    investment.isActive = false;
                }
                break;

            case 'dividend':
            case 'interest':
            case 'bonus':
                // These don't affect the investment quantity/price, just add to current value temporarily
                // In a real implementation, you might want to track these separately
                break;
        }

        await investment.save();
    }

    private isCreateInvestmentTransactionDto(obj: unknown): obj is CreateInvestmentTransactionDto {
        if (!obj || typeof obj !== 'object') return false;
        const o = obj as Record<string, unknown>;
        return (
            typeof o.investmentId === 'string' &&
            typeof o.type === 'string' &&
            typeof o.quantity === 'number' &&
            typeof o.price === 'number' &&
            typeof o.date === 'string'
        );
    }

    private async updateInvestmentFromTransactionChange(
        oldTransaction: unknown,
        newTransaction: unknown,
        userId: ID,
    ): Promise<void> {
        // Prefer a narrow, type-guarded call to avoid passing `any` to the updater
        if (this.isCreateInvestmentTransactionDto(newTransaction)) {
            await this.updateInvestmentFromTransaction(newTransaction, userId);
            return;
        }

        // If the shape is not strictly the DTO, attempt a best-effort conversion
        try {
            const candidate = newTransaction as CreateInvestmentTransactionDto;
            if (candidate && typeof candidate.investmentId === 'string') {
                await this.updateInvestmentFromTransaction(candidate, userId);
            }
        } catch {
            // Unable to process change safely; skip
        }
    }

    private async reverseTransactionEffect(transaction: InvestmentTransaction, userId: ID): Promise<void> {
        const investment = await this.investmentModel.findOne({ _id: transaction.investmentId, userId }).exec();
        if (!investment) return;

        switch (transaction.type) {
            case 'buy':
                investment.quantity -= transaction.quantity;
                // Recalculate average price (this is simplified)
                investment.totalInvested -= transaction.totalValue;
                if (investment.quantity > 0) {
                    investment.averagePrice = investment.totalInvested / investment.quantity;
                }
                break;

            case 'sell':
                investment.quantity += transaction.quantity;
                investment.isActive = true; // Reactivate if it was deactivated
                break;
        }

        await investment.save();
    }

    private async getRecentTransactions(
        userId: ID,
        limit: number = 10,
    ): Promise<Array<{ investmentName: string; type: TransactionType; amount: number; date: Date }>> {
        const transactions = await this.investmentTransactionModel
            .find({ userId })
            .sort({ date: -1 })
            .limit(limit)
            .populate('investmentId', 'name')
            .lean()
            .exec();

        return transactions.map((t: any) => ({
            investmentName: t.investmentId?.name || 'Unknown',
            type: t.type,
            amount: t.totalValue,
            date: t.date,
        }));
    }

    private async getMonthlyEvolution(
        userId: ID,
    ): Promise<Array<{ month: string; totalValue: number; totalInvested: number }>> {
        // This is a simplified implementation - in a real scenario, you'd want to calculate
        // the portfolio value at the end of each month
        const investments = await this.findAll(userId);

        // For now, return current values
        return [
            {
                month: new Date().toISOString().slice(0, 7), // YYYY-MM format
                totalValue: investments.reduce((sum, inv) => sum + (inv.currentValue || inv.totalInvested), 0),
                totalInvested: investments.reduce((sum, inv) => sum + inv.totalInvested, 0),
            },
        ];
    }
}
