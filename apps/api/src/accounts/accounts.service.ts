import { ID } from '@/models/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Account, AccountSummary, AccountType } from '../models/account';
import { mapCreateAccountDtoToAccount, mapUpdateAccountDtoToPartial } from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import type { AccountDocument } from './schemas/account.schema';

type LeanAccount = Omit<AccountDocument, 'save' | 'toObject' | 'id'> & { _id?: any };

@Injectable()
export class AccountsService {
    constructor(@InjectModel('Account') private accountModel: Model<AccountDocument>) {}

    async create(createAccountDto: CreateAccountDto, userId: ID): Promise<Account> {
        const doc = mapCreateAccountDtoToAccount(createAccountDto, userId);
        const created = await this.accountModel.create(doc as unknown as AccountDocument);
        return (await this.accountModel.findById(created._id).lean<LeanAccount>().exec()) as unknown as Account;
    }

    async findAll(userId: ID): Promise<Account[]> {
        return (await this.accountModel
            .find({ userId, isActive: true })
            .lean<LeanAccount>()
            .exec()) as unknown as Account[];
    }

    async findOne(_id: ID, userId: ID): Promise<Account> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.accountModel
            .findOne({ _id, userId })
            .lean<LeanAccount>()
            .exec()) as unknown as Account | null;
        if (!doc) throw new NotFoundException(`Account with ID "${String(_id)}" not found`);
        return doc;
    }

    async update(_id: ID, updateAccountDto: UpdateAccountDto, userId: ID): Promise<Account> {
        UuidUtil.validateUuid(_id);
        const existing = await this.accountModel.findOne({ _id, userId }).exec();
        if (!existing) throw new NotFoundException(`Account with ID "${String(_id)}" not found`);
        Object.assign(existing, mapUpdateAccountDtoToPartial(updateAccountDto));
        await existing.save();
        return (await this.accountModel.findById(_id).lean<LeanAccount>().exec()) as unknown as Account;
    }

    async remove(_id: ID, userId: ID): Promise<Account> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.accountModel
            .findOne({ _id, userId })
            .lean<LeanAccount>()
            .exec()) as unknown as Account | null;
        if (!doc) throw new NotFoundException(`Account with ID "${String(_id)}" not found`);
        await this.accountModel.deleteOne({ _id, userId }).exec();
        return doc;
    }

    async updateBalance(accountId: ID, userId: ID, amount: number): Promise<Account> {
        UuidUtil.validateUuid(accountId);
        const account = await this.accountModel.findOne({ _id: accountId, userId }).exec();
        if (!account) throw new NotFoundException(`Account with ID "${String(accountId)}" not found`);

        account.currentBalance += amount;
        await account.save();
        return (await this.accountModel.findById(accountId).lean<LeanAccount>().exec()) as unknown as Account;
    }

    async getAccountsSummary(userId: ID): Promise<AccountSummary> {
        const accounts = await this.findAll(userId);

        const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);

        const accountsByType = accounts.reduce(
            (acc, account) => {
                acc[account.type] = (acc[account.type] || 0) + account.currentBalance;
                return acc;
            },
            {} as Record<AccountType, number>,
        );

        // Get recent transactions (this would need to be implemented with actual transaction history)
        const recentTransactions: AccountSummary['recentTransactions'] = [];

        return {
            totalBalance,
            accountsCount: accounts.length,
            accountsByType,
            recentTransactions,
        };
    }

    async getTotalBalance(userId: ID): Promise<number> {
        const accounts = await this.findAll(userId);
        return accounts.reduce((sum, account) => sum + account.currentBalance, 0);
    }
}
