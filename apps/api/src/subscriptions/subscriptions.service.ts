import { ID } from '@/models/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { FeatureCode, Plan, Subscription, UserFeatures } from '../models/subscription';
import {
    mapCreatePlanDtoToPlan,
    mapCreateSubscriptionDtoToSubscription,
    mapUpdatePlanDtoToPartial,
    mapUpdateSubscriptionDtoToPartial,
} from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreatePlanDto } from './dto/create-plan.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import type { PlanDocument } from './schemas/plan.schema';
import type { SubscriptionDocument } from './schemas/subscription.schema';

type LeanSubscription = Omit<SubscriptionDocument, 'save' | 'toObject' | 'id'> & { _id?: any };
type LeanPlan = Omit<PlanDocument, 'save' | 'toObject' | 'id'> & { _id?: any };

@Injectable()
export class SubscriptionsService {
    constructor(
        @InjectModel('Subscription') private subscriptionModel: Model<SubscriptionDocument>,
        @InjectModel('Plan') private planModel: Model<PlanDocument>,
    ) {}

    // Default features for free users
    private readonly FREE_FEATURES: FeatureCode[] = ['basic_finances', 'offline_sync'];

    // All premium features
    private readonly PREMIUM_FEATURES: FeatureCode[] = [
        'advanced_finances',
        'investments',
        'gamification',
        'education',
        'bank_integration',
        'advanced_reports',
        'unlimited_storage',
        'priority_support',
    ];

    // Plans CRUD (Admin only)
    async createPlan(createPlanDto: CreatePlanDto): Promise<Plan> {
        const doc = mapCreatePlanDtoToPlan(createPlanDto);
        const created = await this.planModel.create(doc as unknown as PlanDocument);
        return (await this.planModel.findById(created._id).lean<LeanPlan>().exec()) as unknown as Plan;
    }

    async findAllPlans(): Promise<Plan[]> {
        return (await this.planModel
            .find({ isActive: true })
            .sort({ price: 1 })
            .lean<LeanPlan>()
            .exec()) as unknown as Plan[];
    }

    async findPlan(_id: ID): Promise<Plan> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.planModel
            .findOne({ _id, isActive: true })
            .lean<LeanPlan>()
            .exec()) as unknown as Plan | null;
        if (!doc) throw new NotFoundException(`Plan with ID "${String(_id)}" not found`);
        return doc;
    }

    async updatePlan(_id: ID, updatePlanDto: UpdatePlanDto): Promise<Plan> {
        UuidUtil.validateUuid(_id);
        const existing = await this.planModel.findById(_id).exec();
        if (!existing) throw new NotFoundException(`Plan with ID "${String(_id)}" not found`);
        Object.assign(existing, mapUpdatePlanDtoToPartial(updatePlanDto));
        await existing.save();
        return (await this.planModel.findById(_id).lean<LeanPlan>().exec()) as unknown as Plan;
    }

    async removePlan(_id: ID): Promise<Plan> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.planModel
            .findOne({ _id, isActive: true })
            .lean<LeanPlan>()
            .exec()) as unknown as Plan | null;
        if (!doc) throw new NotFoundException(`Plan with ID "${String(_id)}" not found`);
        await this.planModel.findByIdAndUpdate(_id, { isActive: false });
        return doc;
    }

    // Subscriptions CRUD
    async createSubscription(createSubscriptionDto: CreateSubscriptionDto, userId: ID): Promise<Subscription> {
        const doc = mapCreateSubscriptionDtoToSubscription(createSubscriptionDto, userId);
        const created = await this.subscriptionModel.create(doc as unknown as SubscriptionDocument);
        return (await this.subscriptionModel
            .findById(created._id)
            .lean<LeanSubscription>()
            .exec()) as unknown as Subscription;
    }

    async getUserSubscription(userId: ID): Promise<Subscription | null> {
        const subscription = await this.subscriptionModel
            .findOne({
                userId,
                status: { $in: ['active', 'trial'] },
            })
            .sort({ createdAt: -1 })
            .lean<LeanSubscription>()
            .exec();

        return subscription as unknown as Subscription | null;
    }

    async getUserFeatures(userId: ID): Promise<UserFeatures> {
        const subscription = await this.getUserSubscription(userId);
        const features: Record<FeatureCode, boolean> = {} as Record<FeatureCode, boolean>;

        // Initialize all features as false
        [...this.FREE_FEATURES, ...this.PREMIUM_FEATURES].forEach((feature) => {
            features[feature] = false;
        });

        // Enable free features
        this.FREE_FEATURES.forEach((feature) => {
            features[feature] = true;
        });

        // Enable premium features if user has active subscription
        if (subscription && (subscription.status === 'active' || subscription.status === 'trial')) {
            try {
                const plan = await this.findPlan(subscription.planId);

                // Enable features based on plan
                plan.features.forEach((planFeature) => {
                    if (planFeature.isEnabled) {
                        features[planFeature.code as FeatureCode] = true;
                    }
                });

                // Also enable features from subscription features array
                subscription.features.forEach((featureCode) => {
                    features[featureCode as FeatureCode] = true;
                });
            } catch (error) {
                console.warn('Could not load plan features:', error);
            }
        }

        return {
            userId,
            features,
            subscription: subscription
                ? {
                      planId: subscription.planId,
                      planName: 'Current Plan', // Would need to join with plan
                      status: subscription.status,
                      endDate: subscription.endDate,
                  }
                : undefined,
        };
    }

    async hasFeatureAccess(userId: ID, feature: FeatureCode): Promise<boolean> {
        const userFeatures = await this.getUserFeatures(userId);
        return userFeatures.features[feature] || false;
    }

    async updateSubscription(_id: ID, updateSubscriptionDto: UpdateSubscriptionDto, userId: ID): Promise<Subscription> {
        UuidUtil.validateUuid(_id);
        const existing = await this.subscriptionModel.findOne({ _id, userId }).exec();
        if (!existing) throw new NotFoundException(`Subscription with ID "${String(_id)}" not found`);
        Object.assign(existing, mapUpdateSubscriptionDtoToPartial(updateSubscriptionDto));
        await existing.save();
        return (await this.subscriptionModel.findById(_id).lean<LeanSubscription>().exec()) as unknown as Subscription;
    }

    async cancelSubscription(_id: ID, userId: ID): Promise<Subscription> {
        UuidUtil.validateUuid(_id);
        const subscription = await this.subscriptionModel.findOne({ _id, userId }).exec();
        if (!subscription) throw new NotFoundException(`Subscription with ID "${String(_id)}" not found`);

        subscription.status = 'canceled';
        subscription.autoRenew = false;
        await subscription.save();

        return (await this.subscriptionModel.findById(_id).lean<LeanSubscription>().exec()) as unknown as Subscription;
    }

    // Subscription management
    async upgradeSubscription(userId: ID, planId: ID): Promise<Subscription> {
        const existingSubscription = await this.getUserSubscription(userId);

        if (existingSubscription) {
            // Update existing subscription
            const plan = await this.findPlan(planId);
            const now = new Date();
            const nextPaymentDate =
                plan.interval === 'monthly'
                    ? new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
                    : new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

            return this.updateSubscription(
                existingSubscription._id,
                {
                    planId,
                    status: 'active',
                    nextPaymentDate: nextPaymentDate.toISOString(),
                    amount: plan.price,
                    features: plan.features.map((f) => f.code),
                },
                userId,
            );
        } else {
            // Create new subscription
            const plan = await this.findPlan(planId);
            const now = new Date();
            const trialEndDate = plan.trialDays ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000) : now;
            const nextPaymentDate =
                plan.interval === 'monthly'
                    ? new Date(trialEndDate.getFullYear(), trialEndDate.getMonth() + 1, trialEndDate.getDate())
                    : new Date(trialEndDate.getFullYear() + 1, trialEndDate.getMonth(), trialEndDate.getDate());

            return this.createSubscription(
                {
                    planId,
                    status: (plan.trialDays ?? 0) > 0 ? 'trial' : 'active',
                    startDate: now.toISOString(),
                    endDate: (plan.trialDays ?? 0) > 0 ? trialEndDate.toISOString() : undefined,
                    amount: plan.price,
                    features: plan.features.map((f) => f.code),
                    nextPaymentDate: nextPaymentDate.toISOString(),
                },
                userId,
            );
        }
    }

    async checkSubscriptionStatus(userId: ID): Promise<{
        hasActiveSubscription: boolean;
        isTrial: boolean;
        daysRemaining: number;
        planName?: string;
    }> {
        const subscription = await this.getUserSubscription(userId);

        if (!subscription) {
            return {
                hasActiveSubscription: false,
                isTrial: false,
                daysRemaining: 0,
            };
        }

        const now = new Date();
        let daysRemaining = 0;

        if (subscription.endDate) {
            daysRemaining = Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        return {
            hasActiveSubscription: subscription.status === 'active' || subscription.status === 'trial',
            isTrial: subscription.status === 'trial',
            daysRemaining: Math.max(0, daysRemaining),
            planName: 'Current Plan', // Would need to join with plan
        };
    }

    // Initialize default plans (should be called on app startup)
    async initializeDefaultPlans(): Promise<void> {
        const existingPlans = await this.planModel.countDocuments();

        if (existingPlans === 0) {
            const defaultPlans = [
                {
                    name: 'Free',
                    description: 'Basic financial management',
                    price: 0,
                    currency: 'BRL',
                    interval: 'monthly' as const,
                    features: [
                        {
                            name: 'Basic Finances',
                            description: 'Expenses, accounts, categories',
                            code: 'basic_finances',
                            isEnabled: true,
                        },
                        {
                            name: 'Offline Sync',
                            description: 'Offline functionality',
                            code: 'offline_sync',
                            isEnabled: true,
                        },
                    ],
                    isActive: true,
                    trialDays: 0,
                },
                {
                    name: 'Premium',
                    description: 'Advanced financial management with investments',
                    price: 29.9,
                    currency: 'BRL',
                    interval: 'monthly' as const,
                    features: [
                        {
                            name: 'Basic Finances',
                            description: 'Expenses, accounts, categories',
                            code: 'basic_finances',
                            isEnabled: true,
                        },
                        {
                            name: 'Advanced Finances',
                            description: 'Budgets, goals, credit cards',
                            code: 'advanced_finances',
                            isEnabled: true,
                        },
                        {
                            name: 'Investments',
                            description: 'Investment portfolio tracking',
                            code: 'investments',
                            isEnabled: true,
                        },
                        {
                            name: 'Offline Sync',
                            description: 'Offline functionality',
                            code: 'offline_sync',
                            isEnabled: true,
                        },
                        {
                            name: 'Gamification',
                            description: 'Achievements and badges',
                            code: 'gamification',
                            isEnabled: true,
                        },
                        {
                            name: 'Education',
                            description: 'Financial education content',
                            code: 'education',
                            isEnabled: true,
                        },
                    ],
                    isActive: true,
                    trialDays: 7,
                },
                {
                    name: 'Professional',
                    description: 'Complete financial suite with bank integration',
                    price: 59.9,
                    currency: 'BRL',
                    interval: 'monthly' as const,
                    features: [
                        {
                            name: 'Basic Finances',
                            description: 'Expenses, accounts, categories',
                            code: 'basic_finances',
                            isEnabled: true,
                        },
                        {
                            name: 'Advanced Finances',
                            description: 'Budgets, goals, credit cards',
                            code: 'advanced_finances',
                            isEnabled: true,
                        },
                        {
                            name: 'Investments',
                            description: 'Investment portfolio tracking',
                            code: 'investments',
                            isEnabled: true,
                        },
                        {
                            name: 'Offline Sync',
                            description: 'Offline functionality',
                            code: 'offline_sync',
                            isEnabled: true,
                        },
                        {
                            name: 'Gamification',
                            description: 'Achievements and badges',
                            code: 'gamification',
                            isEnabled: true,
                        },
                        {
                            name: 'Education',
                            description: 'Financial education content',
                            code: 'education',
                            isEnabled: true,
                        },
                        {
                            name: 'Bank Integration',
                            description: 'Automatic bank transaction import',
                            code: 'bank_integration',
                            isEnabled: true,
                        },
                        {
                            name: 'Advanced Reports',
                            description: 'Detailed analytics and projections',
                            code: 'advanced_reports',
                            isEnabled: true,
                        },
                        {
                            name: 'Unlimited Storage',
                            description: 'Unlimited data storage',
                            code: 'unlimited_storage',
                            isEnabled: true,
                        },
                        {
                            name: 'Priority Support',
                            description: 'Priority customer support',
                            code: 'priority_support',
                            isEnabled: true,
                        },
                    ],
                    isActive: true,
                    trialDays: 14,
                },
            ];

            for (const planData of defaultPlans) {
                await this.createPlan(planData);
            }
        }
    }
}
