/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ID } from '@/models/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { FilterQuery, SortOrder } from 'mongoose';

import { AccountsService } from '../accounts/accounts.service';
import { CreditCardsService } from '../credit-cards/credit-cards.service';
import { CreditTransactionsService } from '../credit-transactions/credit-transactions.service';
import { Expense } from '../models/expense';
import { mapCreateExpenseDtoToExpense, mapUpdateExpenseDtoToPartial } from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseFiltersDto } from './dto/expense-filters.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import type { ExpenseDocument } from './schemas/expense.schema';

type LeanExpense = Omit<ExpenseDocument, 'save' | 'toObject' | 'id'> & { _id?: any };

@Injectable()
export class ExpensesService {
    constructor(
        @InjectModel('Expense') private expenseModel: Model<ExpenseDocument>,
        private accountsService: AccountsService,
        private creditCardsService: CreditCardsService,
        private creditTransactionsService: CreditTransactionsService,
    ) {}

    async create(createExpenseDto: CreateExpenseDto, userId: ID): Promise<Expense> {
        const doc = mapCreateExpenseDtoToExpense(createExpenseDto, userId);
        const created = await this.expenseModel.create(doc as unknown as ExpenseDocument);

        // Update account balance if accountId is provided
        if (createExpenseDto.accountId) {
            await this.accountsService.updateBalance(createExpenseDto.accountId, userId, -createExpenseDto.amount);
        }

        // Create credit transaction if payment method is credit card
        if (createExpenseDto.paymentMethod === 'credit_card' && createExpenseDto.accountId) {
            try {
                // Find the credit card associated with this account (assuming account represents a credit card)
                // In a real implementation, you might want to add a separate cardId field to expenses
                // For now, we'll use the accountId as the cardId
                const cardId = createExpenseDto.accountId;

                // Calculate due date based on credit card settings
                const creditCard = await this.creditCardsService.findOne(cardId, userId);
                const transactionDate = new Date(createExpenseDto.date);
                const dueDate = this.calculateDueDate(transactionDate, creditCard.dueDay, creditCard.closingDay);

                await this.creditTransactionsService.create(
                    {
                        cardId,
                        expenseId: created._id,
                        amount: createExpenseDto.amount,
                        description: createExpenseDto.description || 'Expense',
                        transactionDate: createExpenseDto.date,
                        dueDate: dueDate.toISOString(),
                    },
                    userId,
                );

                // Update credit card balance
                await this.creditCardsService.updateBalance(cardId, userId, createExpenseDto.amount);
            } catch (error) {
                console.error('Failed to create credit transaction:', error);
                // Don't fail the expense creation if credit transaction fails
            }
        }

        return (await this.expenseModel.findById(created._id).lean<LeanExpense>().exec()) as unknown as Expense;
    }

    async findAll(userId: ID, filters?: ExpenseFiltersDto): Promise<Expense[]> {
        const query: FilterQuery<ExpenseDocument> = { userId } as FilterQuery<ExpenseDocument>;

        // Apply filters
        if (filters?.categoryId) {
            query.categoryId = filters.categoryId;
        }

        if (filters?.paymentMethod) {
            query.paymentMethod = filters.paymentMethod;
        }

        if (filters?.accountId) {
            query.accountId = filters.accountId;
        }

        if (filters?.startDate || filters?.endDate) {
            query.date = {};
            if (filters.startDate) {
                query.date.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                query.date.$lte = new Date(filters.endDate);
            }
        }

        // Apply sorting
        const sortOptions: { [key: string]: SortOrder } = {};
        const sortBy = filters?.sortBy || 'date';
        const sortOrder: SortOrder = filters?.sortOrder === 'asc' ? 1 : -1;
        sortOptions[String(sortBy)] = sortOrder;

        // Apply pagination
        const limit = filters?.limit || 50;
        const offset = filters?.offset || 0;

        return (await this.expenseModel
            .find(query)
            .sort(sortOptions)
            .limit(limit)
            .skip(offset)
            .lean<LeanExpense>()
            .exec()) as unknown as Expense[];
    }

    async findOne(_id: ID, userId: ID): Promise<Expense> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.expenseModel
            .findOne({ _id, userId })
            .lean<LeanExpense>()
            .exec()) as unknown as Expense | null;
        if (!doc) throw new NotFoundException(`Expense with ID "${String(_id)}" not found`);
        return doc;
    }

    async update(_id: ID, updateExpenseDto: UpdateExpenseDto, userId: ID): Promise<Expense> {
        UuidUtil.validateUuid(_id);
        const existing = await this.expenseModel.findOne({ _id, userId }).exec();
        if (!existing) throw new NotFoundException(`Expense with ID "${String(_id)}" not found`);

        const oldAmount = existing.amount;
        const oldAccountId = existing.accountId;

        Object.assign(existing, mapUpdateExpenseDtoToPartial(updateExpenseDto));
        await existing.save();

        // Handle balance updates
        const newAmount = existing.amount;
        const newAccountId = existing.accountId;

        // Reverse old balance update
        if (oldAccountId) {
            await this.accountsService.updateBalance(oldAccountId, userId, oldAmount);
        }

        // Apply new balance update
        if (newAccountId) {
            await this.accountsService.updateBalance(newAccountId, userId, -newAmount);
        }

        return (await this.expenseModel.findById(_id).lean<LeanExpense>().exec()) as unknown as Expense;
    }

    async remove(_id: ID, userId: ID): Promise<Expense> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.expenseModel
            .findOne({ _id, userId })
            .lean<LeanExpense>()
            .exec()) as unknown as Expense | null;
        if (!doc) throw new NotFoundException(`Expense with ID "${String(_id)}" not found`);

        // Reverse balance update before deleting
        if (doc.accountId) {
            await this.accountsService.updateBalance(doc.accountId, userId, doc.amount);
        }

        await this.expenseModel.deleteOne({ _id, userId }).exec();
        return doc;
    }

    async getExpensesSummary(userId: ID, month?: string): Promise<any> {
        const matchQuery: any = { userId };

        // If month is provided, filter by month
        if (month) {
            const startOfMonth = new Date(month + '-01');
            const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
            matchQuery.date = {
                $gte: startOfMonth,
                $lte: endOfMonth,
            };
        }

        const summary = await this.expenseModel.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$categoryId',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $unwind: '$category',
            },
            {
                $project: {
                    categoryId: '$_id',
                    categoryName: '$category.names.pt', // Assuming Portuguese names
                    totalAmount: 1,
                    count: 1,
                    _id: 0,
                },
            },
            {
                $sort: { totalAmount: -1 },
            },
        ]);

        const totalExpenses = summary.reduce((sum, item) => sum + item.totalAmount, 0);

        return {
            totalExpenses,
            categories: summary.map((item) => ({
                ...item,
                percentage: totalExpenses > 0 ? (item.totalAmount / totalExpenses) * 100 : 0,
            })),
        };
    }

    async getMonthlyExpenses(userId: ID, year: number): Promise<any> {
        const monthlyData = await this.expenseModel.aggregate([
            {
                $match: {
                    userId,
                    date: {
                        $gte: new Date(year, 0, 1),
                        $lte: new Date(year, 11, 31),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m',
                            date: '$date',
                        },
                    },
                    totalAmount: { $sum: '$amount' },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        return monthlyData.map((item) => ({
            month: item._id,
            totalAmount: item.totalAmount,
        }));
    }

    private calculateDueDate(transactionDate: Date, dueDay: number, closingDay: number): Date {
        const transactionDay = transactionDate.getDate();
        const transactionMonth = transactionDate.getMonth();
        const transactionYear = transactionDate.getFullYear();

        let dueMonth = transactionMonth;
        let dueYear = transactionYear;

        // If transaction is after closing day, due date is next month
        if (transactionDay > closingDay) {
            dueMonth = transactionMonth === 11 ? 0 : transactionMonth + 1;
            dueYear = transactionMonth === 11 ? transactionYear + 1 : transactionYear;
        }

        return new Date(dueYear, dueMonth, dueDay);
    }
}
