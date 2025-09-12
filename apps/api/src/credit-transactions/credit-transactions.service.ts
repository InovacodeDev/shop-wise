/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ID } from '@/models/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreditInvoice, CreditTransaction, CreditTransactionSummary } from '../models/credit-transaction';
import {
    mapCreateCreditTransactionDtoToCreditTransaction,
    mapUpdateCreditTransactionDtoToPartial,
} from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreateCreditTransactionDto } from './dto/create-credit-transaction.dto';
import { UpdateCreditTransactionDto } from './dto/update-credit-transaction.dto';
import type { CreditTransactionDocument } from './schemas/credit-transaction.schema';

type LeanCreditTransaction = Omit<CreditTransactionDocument, 'save' | 'toObject' | 'id'> & { _id?: any };

@Injectable()
export class CreditTransactionsService {
    constructor(@InjectModel('CreditTransaction') private creditTransactionModel: Model<CreditTransactionDocument>) {}

    async create(createCreditTransactionDto: CreateCreditTransactionDto, userId: ID): Promise<CreditTransaction> {
        const doc = mapCreateCreditTransactionDtoToCreditTransaction(createCreditTransactionDto, userId);
        const created = await this.creditTransactionModel.create(doc as unknown as CreditTransactionDocument);
        return (await this.creditTransactionModel
            .findById(created._id)
            .lean<LeanCreditTransaction>()
            .exec()) as unknown as CreditTransaction;
    }

    async findAll(userId: ID, cardId?: ID): Promise<CreditTransaction[]> {
        const query: any = { userId };
        if (cardId) {
            query.cardId = cardId;
        }
        return (await this.creditTransactionModel
            .find(query)
            .sort({ transactionDate: -1 })
            .lean<LeanCreditTransaction>()
            .exec()) as unknown as CreditTransaction[];
    }

    async findOne(_id: ID, userId: ID): Promise<CreditTransaction> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.creditTransactionModel
            .findOne({ _id, userId })
            .lean<LeanCreditTransaction>()
            .exec()) as unknown as CreditTransaction | null;
        if (!doc) throw new NotFoundException(`Credit transaction with ID "${String(_id)}" not found`);
        return doc;
    }

    async update(
        _id: ID,
        updateCreditTransactionDto: UpdateCreditTransactionDto,
        userId: ID,
    ): Promise<CreditTransaction> {
        UuidUtil.validateUuid(_id);
        const existing = await this.creditTransactionModel.findOne({ _id, userId }).exec();
        if (!existing) throw new NotFoundException(`Credit transaction with ID "${String(_id)}" not found`);
        Object.assign(existing, mapUpdateCreditTransactionDtoToPartial(updateCreditTransactionDto));
        await existing.save();
        return (await this.creditTransactionModel
            .findById(_id)
            .lean<LeanCreditTransaction>()
            .exec()) as unknown as CreditTransaction;
    }

    async remove(_id: ID, userId: ID): Promise<CreditTransaction> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.creditTransactionModel
            .findOne({ _id, userId })
            .lean<LeanCreditTransaction>()
            .exec()) as unknown as CreditTransaction | null;
        if (!doc) throw new NotFoundException(`Credit transaction with ID "${String(_id)}" not found`);
        await this.creditTransactionModel.deleteOne({ _id, userId }).exec();
        return doc;
    }

    async markAsPaid(_id: ID, userId: ID): Promise<CreditTransaction> {
        UuidUtil.validateUuid(_id);
        const transaction = await this.creditTransactionModel.findOne({ _id, userId }).exec();
        if (!transaction) throw new NotFoundException(`Credit transaction with ID "${String(_id)}" not found`);

        transaction.isPaid = true;
        transaction.paidDate = new Date();
        await transaction.save();
        return (await this.creditTransactionModel
            .findById(_id)
            .lean<LeanCreditTransaction>()
            .exec()) as unknown as CreditTransaction;
    }

    async getCreditTransactionsSummary(userId: ID): Promise<CreditTransactionSummary> {
        const transactions = await this.findAll(userId);

        const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        const paidTransactions = transactions.filter((t) => t.isPaid).length;
        const unpaidTransactions = transactions.filter((t) => !t.isPaid).length;

        // Get upcoming payments (due in the next 30 days)
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const upcomingPayments = transactions
            .filter((t) => !t.isPaid && t.dueDate <= thirtyDaysFromNow)
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
            .slice(0, 5) // Limit to 5 upcoming payments
            .map((t) => ({
                transactionId: t._id,
                cardName: '', // Would need to join with credit cards table
                description: t.description,
                amount: t.amount,
                dueDate: t.dueDate,
            }));

        return {
            totalTransactions: transactions.length,
            totalAmount,
            paidTransactions,
            unpaidTransactions,
            upcomingPayments,
        };
    }

    async generateInvoice(cardId: ID, userId: ID, month: string): Promise<CreditInvoice> {
        // Parse month (expected format: YYYY-MM)
        const [year, monthNum] = month.split('-').map(Number);
        const invoiceStartDate = new Date(year, monthNum - 1, 1);
        const invoiceEndDate = new Date(year, monthNum, 0); // Last day of the month

        const transactions = (await this.creditTransactionModel
            .find({
                userId,
                cardId,
                transactionDate: {
                    $gte: invoiceStartDate,
                    $lte: invoiceEndDate,
                },
            })
            .lean<LeanCreditTransaction>()
            .exec()) as unknown as CreditTransaction[];

        const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

        // Mock card name - in a real implementation, this would come from a join
        const cardName = `Cartão ${cardId.slice(-4)}`;

        return {
            cardId,
            cardName,
            month,
            totalAmount,
            dueDate: new Date(year, monthNum, 10), // Mock due date
            transactions: transactions.map((t) => ({
                transactionId: t._id,
                description: t.description,
                amount: t.amount,
                transactionDate: t.transactionDate,
                installmentInfo:
                    t.installmentNumber && t.totalInstallments
                        ? `${t.installmentNumber}/${t.totalInstallments}`
                        : undefined,
            })),
            isPaid: false, // Would need to track invoice payment status
        };
    }
}
