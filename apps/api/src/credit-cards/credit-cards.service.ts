import { ID } from '@/models/common';
import { CreateCreditCard } from '@/models/create-types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CardType, CreditCard, CreditCardSummary } from '../models/credit-card';
import { mapCreateCreditCardDtoToCreditCard, mapUpdateCreditCardDtoToPartial } from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import type { CreditCardDocument } from './schemas/credit-card.schema';

type LeanCreditCard = Omit<CreditCardDocument, 'save' | 'toObject' | 'id'> & { _id?: any };

@Injectable()
export class CreditCardsService {
    constructor(@InjectModel('CreditCard') private creditCardModel: Model<CreditCardDocument>) {}

    async create(createCreditCardDto: CreateCreditCardDto, userId: ID): Promise<CreditCard> {
        const doc: CreateCreditCard = mapCreateCreditCardDtoToCreditCard(createCreditCardDto, userId);
        const created = await this.creditCardModel.create(doc as unknown as CreditCardDocument);
        return (await this.creditCardModel
            .findById(created._id)
            .lean<LeanCreditCard>()
            .exec()) as unknown as CreditCard;
    }

    async findAll(userId: ID): Promise<CreditCard[]> {
        return (await this.creditCardModel
            .find({ userId, isActive: true })
            .lean<LeanCreditCard>()
            .exec()) as unknown as CreditCard[];
    }

    async findOne(_id: ID, userId: ID): Promise<CreditCard> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.creditCardModel
            .findOne({ _id, userId })
            .lean<LeanCreditCard>()
            .exec()) as unknown as CreditCard | null;
        if (!doc) throw new NotFoundException(`Credit card with ID "${String(_id)}" not found`);
        return doc;
    }

    async update(_id: ID, updateCreditCardDto: UpdateCreditCardDto, userId: ID): Promise<CreditCard> {
        UuidUtil.validateUuid(_id);
        const existing = await this.creditCardModel.findOne({ _id, userId }).exec();
        if (!existing) throw new NotFoundException(`Credit card with ID "${String(_id)}" not found`);
        Object.assign(existing, mapUpdateCreditCardDtoToPartial(updateCreditCardDto));
        await existing.save();
        return (await this.creditCardModel.findById(_id).lean<LeanCreditCard>().exec()) as unknown as CreditCard;
    }

    async remove(_id: ID, userId: ID): Promise<CreditCard> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.creditCardModel
            .findOne({ _id, userId })
            .lean<LeanCreditCard>()
            .exec()) as unknown as CreditCard | null;
        if (!doc) throw new NotFoundException(`Credit card with ID "${String(_id)}" not found`);
        await this.creditCardModel.deleteOne({ _id, userId }).exec();
        return doc;
    }

    async updateBalance(cardId: ID, userId: ID, amount: number): Promise<CreditCard> {
        UuidUtil.validateUuid(cardId);
        const creditCard = await this.creditCardModel.findOne({ _id: cardId, userId }).exec();
        if (!creditCard) throw new NotFoundException(`Credit card with ID "${String(cardId)}" not found`);

        creditCard.currentBalance += amount;
        creditCard.availableLimit = creditCard.creditLimit - creditCard.currentBalance;
        await creditCard.save();
        return (await this.creditCardModel.findById(cardId).lean<LeanCreditCard>().exec()) as unknown as CreditCard;
    }

    async getCreditCardsSummary(userId: ID): Promise<CreditCardSummary> {
        const creditCards = await this.findAll(userId);

        const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.creditLimit, 0);
        const totalUsedLimit = creditCards.reduce((sum, card) => sum + card.currentBalance, 0);
        const totalAvailableLimit = creditCards.reduce((sum, card) => sum + card.availableLimit, 0);

        const cardsByType = creditCards.reduce(
            (acc, card) => {
                acc[card.cardType] = (acc[card.cardType] || 0) + 1;
                return acc;
            },
            {} as Record<CardType, number>,
        );

        // Get upcoming payments (this would need to be implemented with actual transaction data)
        const upcomingPayments: CreditCardSummary['upcomingPayments'] = [];

        return {
            totalCards: creditCards.length,
            totalCreditLimit,
            totalUsedLimit,
            totalAvailableLimit,
            cardsByType,
            upcomingPayments,
        };
    }

    async calculateNextInvoice(cardId: ID, userId: ID): Promise<any> {
        const card = await this.findOne(cardId, userId);

        // Calculate the next invoice period
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let invoiceMonth: number;
        let invoiceYear: number;

        if (now.getDate() <= card.closingDay) {
            // Before closing day, invoice is for current month
            invoiceMonth = currentMonth;
            invoiceYear = currentYear;
        } else {
            // After closing day, invoice is for next month
            invoiceMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            invoiceYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        }

        const invoiceStartDate = new Date(invoiceYear, invoiceMonth - 1, card.closingDay + 1);
        const invoiceEndDate = new Date(invoiceYear, invoiceMonth, card.closingDay);

        return {
            cardId: card._id,
            cardName: card.name,
            period: `${invoiceStartDate.toISOString().split('T')[0]} to ${invoiceEndDate.toISOString().split('T')[0]}`,
            dueDate: new Date(invoiceYear, invoiceMonth, card.dueDay),
            currentBalance: card.currentBalance,
            availableLimit: card.availableLimit,
        };
    }
}
