import { ID } from '@/models/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Budget, BudgetAlert, BudgetSummary } from '../models/budget';
import { mapCreateBudgetDtoToBudget, mapUpdateBudgetDtoToPartial } from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import type { BudgetDocument } from './schemas/budget.schema';

type LeanBudget = Omit<BudgetDocument, 'save' | 'toObject' | 'id'> & { _id?: any };

@Injectable()
export class BudgetsService {
    constructor(
        @InjectModel('Budget') private budgetModel: Model<BudgetDocument>,
        @InjectModel('Expense') private expenseModel: Model<any>,
    ) {}

    async create(createBudgetDto: CreateBudgetDto, userId: ID): Promise<Budget> {
        const doc = mapCreateBudgetDtoToBudget(createBudgetDto, userId);
        const created = await this.budgetModel.create(doc as unknown as BudgetDocument);
        return (await this.budgetModel.findById(created._id).lean<LeanBudget>().exec()) as unknown as Budget;
    }

    async findAll(userId: ID): Promise<Budget[]> {
        return (await this.budgetModel
            .find({ userId, isActive: true })
            .lean<LeanBudget>()
            .exec()) as unknown as Budget[];
    }

    async findOne(_id: ID, userId: ID): Promise<Budget> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.budgetModel
            .findOne({ _id, userId })
            .lean<LeanBudget>()
            .exec()) as unknown as Budget | null;
        if (!doc) throw new NotFoundException(`Budget with ID "${String(_id)}" not found`);
        return doc;
    }

    async update(_id: ID, updateBudgetDto: UpdateBudgetDto, userId: ID): Promise<Budget> {
        UuidUtil.validateUuid(_id);
        const existing = await this.budgetModel.findOne({ _id, userId }).exec();
        if (!existing) throw new NotFoundException(`Budget with ID "${String(_id)}" not found`);
        Object.assign(existing, mapUpdateBudgetDtoToPartial(updateBudgetDto));
        await existing.save();
        return (await this.budgetModel.findById(_id).lean<LeanBudget>().exec()) as unknown as Budget;
    }

    async remove(_id: ID, userId: ID): Promise<Budget> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.budgetModel
            .findOne({ _id, userId })
            .lean<LeanBudget>()
            .exec()) as unknown as Budget | null;
        if (!doc) throw new NotFoundException(`Budget with ID "${String(_id)}" not found`);
        await this.budgetModel.deleteOne({ _id, userId }).exec();
        return doc;
    }

    async getBudgetSummaries(userId: ID): Promise<BudgetSummary[]> {
        const budgets = await this.findAll(userId);
        const summaries: BudgetSummary[] = [];

        for (const budget of budgets) {
            const spent = await this.calculateSpentAmount(budget, userId);
            const remaining = budget.limit - spent;
            const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
            const daysRemaining = this.calculateDaysRemaining(budget.endDate);

            let status: 'on_track' | 'warning' | 'exceeded' = 'on_track';
            if (percentage >= 100) {
                status = 'exceeded';
            } else if (percentage >= 80) {
                status = 'warning';
            }

            summaries.push({
                budgetId: budget._id,
                budgetName: budget.name,
                categoryName: '', // Would need to join with categories table
                limit: budget.limit,
                spent,
                remaining,
                percentage,
                status,
                period: budget.period,
                daysRemaining,
            });
        }

        return summaries;
    }

    async checkBudgetAlerts(userId: ID): Promise<BudgetAlert[]> {
        const budgets = await this.findAll(userId);
        const alerts: BudgetAlert[] = [];

        for (const budget of budgets) {
            const spent = await this.calculateSpentAmount(budget, userId);
            const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

            if (percentage >= 100) {
                alerts.push({
                    budgetId: budget._id,
                    budgetName: budget.name,
                    categoryName: '', // Would need to join with categories table
                    alertType: 'exceeded',
                    currentSpent: spent,
                    limit: budget.limit,
                    percentage,
                    message: `Orçamento excedido! Você gastou R$ ${spent.toFixed(2)} de R$ ${budget.limit.toFixed(2)} (${percentage.toFixed(1)}%)`,
                });
            } else if (percentage >= 80) {
                alerts.push({
                    budgetId: budget._id,
                    budgetName: budget.name,
                    categoryName: '', // Would need to join with categories table
                    alertType: 'warning',
                    currentSpent: spent,
                    limit: budget.limit,
                    percentage,
                    message: `Atenção! Você já gastou ${percentage.toFixed(1)}% do orçamento (R$ ${spent.toFixed(2)} de R$ ${budget.limit.toFixed(2)})`,
                });
            }
        }

        return alerts;
    }

    private async calculateSpentAmount(budget: Budget, userId: ID): Promise<number> {
        const spent = await this.expenseModel.aggregate([
            {
                $match: {
                    userId,
                    categoryId: budget.categoryId,
                    date: {
                        $gte: budget.startDate,
                        $lte: budget.endDate,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                },
            },
        ]);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return spent.length > 0 ? spent[0].total : 0;
    }

    private calculateDaysRemaining(endDate: Date): number {
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    async getBudgetProgress(budgetId: ID, userId: ID): Promise<any> {
        const budget = await this.findOne(budgetId, userId);
        const spent = await this.calculateSpentAmount(budget, userId);

        return {
            budgetId: budget._id,
            budgetName: budget.name,
            limit: budget.limit,
            spent,
            remaining: budget.limit - spent,
            percentage: budget.limit > 0 ? (spent / budget.limit) * 100 : 0,
            period: budget.period,
            startDate: budget.startDate,
            endDate: budget.endDate,
            daysRemaining: this.calculateDaysRemaining(budget.endDate),
        };
    }
}
