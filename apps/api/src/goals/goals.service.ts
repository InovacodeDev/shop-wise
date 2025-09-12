import { ID } from '@/models/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Goal, GoalDeposit, GoalProgress, GoalSummary } from '../models/goal';
import {
    mapCreateGoalDepositDtoToGoalDeposit,
    mapCreateGoalDtoToGoal,
    mapUpdateGoalDepositDtoToPartial,
    mapUpdateGoalDtoToPartial,
} from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreateGoalDepositDto } from './dto/create-goal-deposit.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDepositDto } from './dto/update-goal-deposit.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import type { GoalDepositDocument } from './schemas/goal-deposit.schema';
import type { GoalDocument } from './schemas/goal.schema';

type LeanGoal = Omit<GoalDocument, 'save' | 'toObject' | 'id'> & { _id?: any };
type LeanGoalDeposit = Omit<GoalDepositDocument, 'save' | 'toObject' | 'id'> & { _id?: any };

@Injectable()
export class GoalsService {
    constructor(
        @InjectModel('Goal') private goalModel: Model<GoalDocument>,
        @InjectModel('GoalDeposit') private goalDepositModel: Model<GoalDepositDocument>,
    ) {}

    // Goals CRUD
    async create(createGoalDto: CreateGoalDto, userId: ID): Promise<Goal> {
        const doc = mapCreateGoalDtoToGoal(createGoalDto, userId);
        const created = await this.goalModel.create(doc as unknown as GoalDocument);
        return (await this.goalModel.findById(created._id).lean<LeanGoal>().exec()) as unknown as Goal;
    }

    async findAll(userId: ID): Promise<Goal[]> {
        return (await this.goalModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .lean<LeanGoal>()
            .exec()) as unknown as Goal[];
    }

    async findOne(_id: ID, userId: ID): Promise<Goal> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.goalModel.findOne({ _id, userId }).lean<LeanGoal>().exec()) as unknown as Goal | null;
        if (!doc) throw new NotFoundException(`Goal with ID "${String(_id)}" not found`);
        return doc;
    }

    async update(_id: ID, updateGoalDto: UpdateGoalDto, userId: ID): Promise<Goal> {
        UuidUtil.validateUuid(_id);
        const existing = await this.goalModel.findOne({ _id, userId }).exec();
        if (!existing) throw new NotFoundException(`Goal with ID "${String(_id)}" not found`);
        Object.assign(existing, mapUpdateGoalDtoToPartial(updateGoalDto));
        await existing.save();
        return (await this.goalModel.findById(_id).lean<LeanGoal>().exec()) as unknown as Goal;
    }

    async remove(_id: ID, userId: ID): Promise<Goal> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.goalModel.findOne({ _id, userId }).lean<LeanGoal>().exec()) as unknown as Goal | null;
        if (!doc) throw new NotFoundException(`Goal with ID "${String(_id)}" not found`);
        await this.goalModel.deleteOne({ _id, userId }).exec();
        return doc;
    }

    // Goal Deposits CRUD
    async createDeposit(createGoalDepositDto: CreateGoalDepositDto, userId: ID): Promise<GoalDeposit> {
        const doc = mapCreateGoalDepositDtoToGoalDeposit(createGoalDepositDto, userId);
        const created = await this.goalDepositModel.create(doc as unknown as GoalDepositDocument);

        // Update goal current amount
        await this.updateGoalAmount(createGoalDepositDto.goalId, userId, createGoalDepositDto.amount);

        return (await this.goalDepositModel
            .findById(created._id)
            .lean<LeanGoalDeposit>()
            .exec()) as unknown as GoalDeposit;
    }

    async findDepositsByGoal(goalId: ID, userId: ID): Promise<GoalDeposit[]> {
        UuidUtil.validateUuid(goalId);
        return (await this.goalDepositModel
            .find({ goalId, userId })
            .sort({ depositDate: -1 })
            .lean<LeanGoalDeposit>()
            .exec()) as unknown as GoalDeposit[];
    }

    async updateDeposit(_id: ID, updateGoalDepositDto: UpdateGoalDepositDto, userId: ID): Promise<GoalDeposit> {
        UuidUtil.validateUuid(_id);
        const existing = await this.goalDepositModel.findOne({ _id, userId }).exec();
        if (!existing) throw new NotFoundException(`Goal deposit with ID "${String(_id)}" not found`);

        const oldAmount = existing.amount;
        const oldGoalId = existing.goalId;

        Object.assign(existing, mapUpdateGoalDepositDtoToPartial(updateGoalDepositDto));
        await existing.save();

        const newAmount = existing.amount;
        const newGoalId = existing.goalId;

        // Update goal amounts
        if (oldGoalId !== newGoalId) {
            await this.updateGoalAmount(oldGoalId, userId, -oldAmount);
            await this.updateGoalAmount(newGoalId, userId, newAmount);
        } else if (oldAmount !== newAmount) {
            await this.updateGoalAmount(newGoalId, userId, newAmount - oldAmount);
        }

        return (await this.goalDepositModel.findById(_id).lean<LeanGoalDeposit>().exec()) as unknown as GoalDeposit;
    }

    async removeDeposit(_id: ID, userId: ID): Promise<GoalDeposit> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.goalDepositModel
            .findOne({ _id, userId })
            .lean<LeanGoalDeposit>()
            .exec()) as unknown as GoalDeposit | null;
        if (!doc) throw new NotFoundException(`Goal deposit with ID "${String(_id)}" not found`);

        // Update goal amount
        await this.updateGoalAmount(doc.goalId, userId, -doc.amount);

        await this.goalDepositModel.deleteOne({ _id, userId }).exec();
        return doc;
    }

    // Analytics and summaries
    async getGoalsSummary(userId: ID): Promise<GoalSummary[]> {
        const goals = await this.findAll(userId);
        const summaries: GoalSummary[] = [];

        for (const goal of goals) {
            const progressPercentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const remainingAmount = goal.targetAmount - goal.currentAmount;
            const daysRemaining = this.calculateDaysRemaining(goal.targetDate);

            summaries.push({
                goalId: goal._id,
                name: goal.name,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount,
                progressPercentage,
                remainingAmount,
                daysRemaining,
                isCompleted: goal.isCompleted,
                priority: goal.priority,
                category: goal.category,
            });
        }

        return summaries.sort((a, b) => {
            // Sort by priority first
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            // Then by progress percentage
            return b.progressPercentage - a.progressPercentage;
        });
    }

    async getGoalProgress(goalId: ID, userId: ID): Promise<GoalProgress> {
        const goal = await this.findOne(goalId, userId);
        const deposits = await this.findDepositsByGoal(goalId, userId);

        const totalDeposits = deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
        const averageDeposit = deposits.length > 0 ? totalDeposits / deposits.length : 0;
        const lastDepositDate = deposits.length > 0 ? deposits[0].depositDate : undefined;

        return {
            goalId,
            goalName: goal.name,
            deposits: deposits.map((d) => ({
                depositId: d._id,
                amount: d.amount,
                description: d.description,
                depositDate: d.depositDate,
                source: d.source,
            })),
            totalDeposits,
            averageDeposit,
            lastDepositDate,
        };
    }

    private async updateGoalAmount(goalId: ID, userId: ID, amountChange: number): Promise<void> {
        const goal = await this.goalModel.findOne({ _id: goalId, userId }).exec();
        if (goal) {
            goal.currentAmount += amountChange;

            // Check if goal is completed
            if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
                goal.isCompleted = true;
                goal.completedDate = new Date();
            } else if (goal.currentAmount < goal.targetAmount && goal.isCompleted) {
                goal.isCompleted = false;
                goal.completedDate = undefined;
            }

            await goal.save();
        }
    }

    private calculateDaysRemaining(targetDate: Date): number {
        const now = new Date();
        const diffTime = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    async getUpcomingDeadlines(userId: ID, days: number = 30): Promise<Goal[]> {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        return (await this.goalModel
            .find({
                userId,
                targetDate: { $lte: futureDate },
                isCompleted: false,
            })
            .sort({ targetDate: 1 })
            .lean<LeanGoal>()
            .exec()) as unknown as Goal[];
    }
}
