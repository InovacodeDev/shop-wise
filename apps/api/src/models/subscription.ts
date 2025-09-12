import { BaseModel, ID } from './common';

export interface Subscription extends BaseModel {
    userId: ID; // user._id
    planId: ID; // plan._id
    status: SubscriptionStatus;
    startDate: Date;
    endDate?: Date; // null for active subscriptions
    autoRenew: boolean;
    paymentMethod?: string;
    lastPaymentDate?: Date;
    nextPaymentDate?: Date;
    amount: number; // monthly amount
    currency: string;
    features: string[]; // list of enabled features
}

export interface Plan extends BaseModel {
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'monthly' | 'yearly';
    features: PlanFeature[];
    isActive: boolean;
    maxUsers?: number;
    trialDays?: number;
}

export interface PlanFeature {
    name: string;
    description: string;
    code: string; // unique identifier for feature
    isEnabled: boolean;
}

export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'trial' | 'past_due';

export type FeatureCode =
    | 'basic_finances' // expenses, accounts, categories
    | 'advanced_finances' // budgets, goals, credit cards
    | 'investments' // investment portfolio tracking
    | 'gamification' // achievements and badges
    | 'education' // financial education content
    | 'offline_sync' // offline functionality
    | 'bank_integration' // automatic bank transaction import
    | 'advanced_reports' // detailed analytics and projections
    | 'unlimited_storage' // unlimited data storage
    | 'priority_support'; // priority customer support

export interface UserFeatures {
    userId: ID;
    features: Record<FeatureCode, boolean>;
    subscription?: {
        planId: ID;
        planName: string;
        status: SubscriptionStatus;
        endDate?: Date;
    };
}
