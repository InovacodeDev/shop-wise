import { CreateInvestmentTransactionDto } from '@/investments/dto/create-investment-transaction.dto';
import { CreateInvestmentDto } from '@/investments/dto/create-investment.dto';
import { UpdateInvestmentTransactionDto } from '@/investments/dto/update-investment-transaction.dto';
import { UpdateInvestmentDto } from '@/investments/dto/update-investment.dto';
import { Account } from '@/models/account';
import { Budget } from '@/models/budget';
import { Category } from '@/models/category';
import { ID } from '@/models/common';
import { CreditCard } from '@/models/credit-card';
import { CreditTransaction } from '@/models/credit-transaction';
import { Expense } from '@/models/expense';
import { Goal, GoalDeposit } from '@/models/goal';
import { Investment, InvestmentTransaction } from '@/models/investment';
import { Plan, Subscription } from '@/models/subscription';
import { CreatePlanDto } from '@/subscriptions/dto/create-plan.dto';
import { CreateSubscriptionDto } from '@/subscriptions/dto/create-subscription.dto';
import { UpdatePlanDto } from '@/subscriptions/dto/update-plan.dto';
import { UpdateSubscriptionDto } from '@/subscriptions/dto/update-subscription.dto';
import { randomUUID } from 'crypto';

import { CreateAccountDto } from '../accounts/dto/create-account.dto';
import { UpdateAccountDto } from '../accounts/dto/update-account.dto';
import { CreateBudgetDto } from '../budgets/dto/create-budget.dto';
import { UpdateBudgetDto } from '../budgets/dto/update-budget.dto';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../categories/dto/update-category.dto';
import { CreateCreditCardDto } from '../credit-cards/dto/create-credit-card.dto';
import { UpdateCreditCardDto } from '../credit-cards/dto/update-credit-card.dto';
import { CreateCreditTransactionDto } from '../credit-transactions/dto/create-credit-transaction.dto';
import { UpdateCreditTransactionDto } from '../credit-transactions/dto/update-credit-transaction.dto';
import { CreateExpenseDto } from '../expenses/dto/create-expense.dto';
import { UpdateExpenseDto } from '../expenses/dto/update-expense.dto';
import { CreateFamilyDto } from '../families/dto/create-family.dto';
import { UpdateFamilyDto } from '../families/dto/update-family.dto';
import { CreateGoalDepositDto } from '../goals/dto/create-goal-deposit.dto';
import { CreateGoalDto } from '../goals/dto/create-goal.dto';
import { UpdateGoalDepositDto } from '../goals/dto/update-goal-deposit.dto';
import { UpdateGoalDto } from '../goals/dto/update-goal.dto';
import {
    CreateAccount,
    CreateBudget,
    CreateCategory,
    CreateCreditCard,
    CreateCreditTransaction,
    CreateExpense,
    CreateFamily,
    CreateGoal,
    CreateGoalDeposit,
    CreateInvestment,
    CreateInvestmentTransaction,
    CreatePantryItem,
    CreatePlan,
    CreateProduct,
    CreatePurchase,
    CreateShoppingList,
    CreateStore,
    CreateSubscription,
} from '../models/create-types';
import { Family } from '../models/family';
import { Product, ProductUnit } from '../models/product';
import { Purchase } from '../models/purchase';
import { ShoppingList } from '../models/shopping-list';
import { Store } from '../models/store';
import { StorePreference } from '../models/store-preference';
import { CreatePantryItemDto } from '../pantry-items/dto/create-pantry-item.dto';
// Products
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { CreatePurchaseDto } from '../purchases/dto/create-purchase.dto';
import { UpdatePurchaseDto } from '../purchases/dto/update-purchase.dto';
import { CreateShoppingListDto } from '../shopping-lists/dto/create-shopping-list.dto';
import { UpdateShoppingListDto } from '../shopping-lists/dto/update-shopping-list.dto';
import { CreateStoreDto } from '../stores/dto/create-store.dto';
import { CreateStorePreferenceDto, UpdateStorePreferenceDto } from '../stores/dto/store-preference.dto';
import { UpdateStoreDto } from '../stores/dto/update-store.dto';

export function mapCreateFamilyDtoToFamily(dto: CreateFamilyDto, ownerId: string): CreateFamily {
    const now = new Date();
    return {
        _id: randomUUID(),
        familyName: dto.familyName,
        ownerId,
        plan: 'free',
        planExpiresAt: null,
        familyComposition: { adults: 2, children: 0, pets: 0 },
        createdAt: now,
        updatedAt: now,
    };
}

export function mapUpdateFamilyDtoToPartial(dto: UpdateFamilyDto): Partial<Family> {
    const partial: Partial<Family> = {
        ...dto,
        plan: dto.plan as 'free' | 'premium' | 'pro' | undefined,
    };
    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

export function mapCreatePurchaseDtoToPurchase(dto: CreatePurchaseDto, familyId: ID, userId: ID): CreatePurchase {
    const now = new Date();
    const fid = familyId;
    if (!fid) throw new Error('Invalid familyId');
    const pby = userId;
    if (pby === undefined || pby === null) throw new Error('Invalid userId');
    return {
        _id: randomUUID(),
        familyId: fid,
        purchasedBy: pby ?? undefined,
        date: dto.date ? new Date(dto.date) : undefined,
        totalAmount: dto.totalAmount,
        storeId: dto.storeId,
        storeName: dto.storeName,
        accessKey: dto.accessKey,
        discount: dto.discount,
        purchaseType: dto.purchaseType,
        items: [],
        createdAt: now,
        updatedAt: now,
    };
}

export function mapUpdatePurchaseDtoToPartial(dto: UpdatePurchaseDto): Partial<Purchase> {
    const typed = dto;
    const partial: Partial<Purchase> = {};
    if (typed.storeId !== undefined) partial.storeId = typed.storeId;
    if (typed.storeName !== undefined) partial.storeName = typed.storeName;
    if (typed.date !== undefined) partial.date = typed.date ? new Date(typed.date) : undefined;
    if (typed.totalAmount !== undefined) partial.totalAmount = typed.totalAmount;
    if (typed.discount !== undefined) partial.discount = typed.discount;
    if (typed.purchaseType !== undefined) partial.purchaseType = typed.purchaseType;
    partial.updatedAt = new Date();
    return partial;
}

export function mapCreateShoppingListDtoToShoppingList(
    dto: CreateShoppingListDto,
    familyId: ID,
    userId: ID,
): CreateShoppingList {
    const now = new Date();
    const fid = familyId;
    if (!fid) throw new Error('Invalid familyId');
    const cby = userId;
    if (cby === undefined || cby === null) throw new Error('Invalid userId');
    return {
        _id: randomUUID(),
        familyId: fid,
        name: dto.name,
        status: dto.status,
        createdBy: cby ?? undefined,
        items: [],
        createdAt: now,
        updatedAt: now,
    };
}

export function mapUpdateShoppingListDtoToPartial(dto: UpdateShoppingListDto): Partial<ShoppingList> {
    const partial: Partial<ShoppingList> = { ...dto };
    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

export function mapCreatePantryItemDtoToPantryItem(
    dto: CreatePantryItemDto,
    familyId: ID,
    userId: ID,
): CreatePantryItem {
    const now = new Date();
    const fid = familyId;
    if (!fid) throw new Error('Invalid familyId');
    const aby = userId;
    if (aby === undefined || aby === null) throw new Error('Invalid userId');
    return {
        _id: randomUUID(),
        familyId: fid,
        ...dto,
        productId: dto.productId,
        unit: dto.unit as ProductUnit,
        addedBy: aby ?? undefined,
        lastUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
    };
}

export function mapCreateProductDtoToProduct(dto: CreateProductDto): CreateProduct {
    const now = new Date();
    // normalize DTO -> CreateProduct shape
    return {
        _id: randomUUID(),
        name: dto.productName,
        description: dto.normalizedName,
        brand: dto.brand,
        barcode: dto.barcode,
        category: dto.categoryId,
        subCategory: dto.size,
        unit: 'un',
        createdAt: now,
        updatedAt: now,
    } as CreateProduct;
}

export function mapUpdateProductDtoToPartial(dto: UpdateProductDto): Partial<Product> {
    const partial: Partial<Product> = {};

    // Map DTO fields to model fields
    if (dto.productName !== undefined) partial.name = dto.productName;
    if (dto.brand !== undefined) partial.brand = dto.brand;
    if (dto.barcode !== undefined) partial.barcode = dto.barcode;
    if (dto.categoryId !== undefined) partial.category = dto.categoryId;
    if (dto.size !== undefined) partial.subCategory = dto.size;
    if (dto.normalizedName !== undefined) partial.description = dto.normalizedName;

    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

// Categories
export function mapCreateCategoryDtoToCategory(dto: CreateCategoryDto): CreateCategory {
    const now = new Date();
    return { _id: randomUUID(), ...dto, createdAt: now, updatedAt: now } as CreateCategory;
}

export function mapUpdateCategoryDtoToPartial(dto: UpdateCategoryDto): Partial<Category> {
    const partial: Partial<Category> = { ...dto };
    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

// Stores
export function mapCreateStoreDtoToStore(dto: CreateStoreDto): CreateStore {
    const now = new Date();
    return {
        _id: randomUUID(),
        ...dto,
        cnpj: dto.cnpj!.replace(/\D/g, ''),
        createdAt: now,
        updatedAt: now,
    } as CreateStore;
}

export function mapUpdateStoreDtoToPartial(dto: UpdateStoreDto): Partial<Store> {
    const partial: Partial<Store> = { ...dto };
    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

// Expenses
export function mapCreateExpenseDtoToExpense(dto: CreateExpenseDto, userId: ID): CreateExpense {
    const now = new Date();
    return {
        _id: randomUUID(),
        userId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        date: new Date(dto.date),
        paymentMethod: dto.paymentMethod,
        description: dto.description,
        accountId: dto.accountId,
        tags: dto.tags,
        isRecurring: dto.isRecurring,
        recurringId: dto.recurringId,
        createdAt: now,
        updatedAt: now,
    } as CreateExpense;
}

export function mapUpdateExpenseDtoToPartial(dto: UpdateExpenseDto): Partial<Expense> {
    const partial: Partial<Expense> = {};

    if (dto.categoryId !== undefined) partial.categoryId = dto.categoryId;
    if (dto.amount !== undefined) partial.amount = dto.amount;
    if (dto.date !== undefined) partial.date = new Date(dto.date);
    if (dto.paymentMethod !== undefined) partial.paymentMethod = dto.paymentMethod;
    if (dto.description !== undefined) partial.description = dto.description;
    if (dto.accountId !== undefined) partial.accountId = dto.accountId;
    if (dto.tags !== undefined) partial.tags = dto.tags;
    if (dto.isRecurring !== undefined) partial.isRecurring = dto.isRecurring;
    if (dto.recurringId !== undefined) partial.recurringId = dto.recurringId;

    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

// Accounts
export function mapCreateAccountDtoToAccount(dto: CreateAccountDto, userId: ID): CreateAccount {
    const now = new Date();
    return {
        _id: randomUUID(),
        userId,
        name: dto.name,
        currentBalance: dto.currentBalance || 0,
        type: dto.type,
        institution: dto.institution,
        accountNumber: dto.accountNumber,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        color: dto.color,
        iconName: dto.iconName,
        createdAt: now,
        updatedAt: now,
    } as CreateAccount;
}

export function mapUpdateAccountDtoToPartial(dto: UpdateAccountDto): Partial<Account> {
    const partial: Partial<Account> = {};

    if (dto.name !== undefined) partial.name = dto.name;
    if (dto.currentBalance !== undefined) partial.currentBalance = dto.currentBalance;
    if (dto.type !== undefined) partial.type = dto.type;
    if (dto.institution !== undefined) partial.institution = dto.institution;
    if (dto.accountNumber !== undefined) partial.accountNumber = dto.accountNumber;
    if (dto.isActive !== undefined) partial.isActive = dto.isActive;
    if (dto.color !== undefined) partial.color = dto.color;
    if (dto.iconName !== undefined) partial.iconName = dto.iconName;

    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

// Credit Cards
export function mapCreateCreditCardDtoToCreditCard(dto: CreateCreditCardDto, userId: ID): CreateCreditCard {
    const now = new Date();
    return {
        _id: randomUUID(),
        userId,
        name: dto.name,
        lastFourDigits: dto.lastFourDigits,
        cardType: dto.cardType,
        creditLimit: dto.creditLimit,
        currentBalance: 0,
        availableLimit: dto.creditLimit,
        dueDay: dto.dueDay,
        closingDay: dto.closingDay,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        color: dto.color,
        iconName: dto.iconName,
        createdAt: now,
        updatedAt: now,
    } as CreateCreditCard;
}

export function mapUpdateCreditCardDtoToPartial(dto: UpdateCreditCardDto): Partial<CreditCard> {
    const partial: Partial<CreditCard> = {};

    if (dto.name !== undefined) partial.name = dto.name;
    if (dto.lastFourDigits !== undefined) partial.lastFourDigits = dto.lastFourDigits;
    if (dto.cardType !== undefined) partial.cardType = dto.cardType;
    if (dto.creditLimit !== undefined) partial.creditLimit = dto.creditLimit;
    if (dto.dueDay !== undefined) partial.dueDay = dto.dueDay;
    if (dto.closingDay !== undefined) partial.closingDay = dto.closingDay;
    if (dto.isActive !== undefined) partial.isActive = dto.isActive;
    if (dto.color !== undefined) partial.color = dto.color;
    if (dto.iconName !== undefined) partial.iconName = dto.iconName;

    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

// Credit Transactions
export function mapCreateCreditTransactionDtoToCreditTransaction(
    dto: CreateCreditTransactionDto,
    userId: ID,
): CreateCreditTransaction {
    const now = new Date();
    return {
        _id: randomUUID(),
        userId,
        cardId: dto.cardId,
        expenseId: dto.expenseId,
        amount: dto.amount,
        description: dto.description,
        transactionDate: new Date(dto.transactionDate),
        dueDate: new Date(dto.dueDate),
        isPaid: dto.isPaid || false,
        paidDate: dto.paidDate ? new Date(dto.paidDate) : undefined,
        installmentNumber: dto.installmentNumber,
        totalInstallments: dto.totalInstallments,
        monthlyAmount: dto.monthlyAmount,
        createdAt: now,
        updatedAt: now,
    } as CreateCreditTransaction;
}

export function mapUpdateCreditTransactionDtoToPartial(dto: UpdateCreditTransactionDto): Partial<CreditTransaction> {
    const partial: Partial<CreditTransaction> = {};

    if (dto.cardId !== undefined) partial.cardId = dto.cardId;
    if (dto.expenseId !== undefined) partial.expenseId = dto.expenseId;
    if (dto.amount !== undefined) partial.amount = dto.amount;
    if (dto.description !== undefined) partial.description = dto.description;
    if (dto.transactionDate !== undefined) partial.transactionDate = new Date(dto.transactionDate);
    if (dto.dueDate !== undefined) partial.dueDate = new Date(dto.dueDate);
    if (dto.isPaid !== undefined) partial.isPaid = dto.isPaid;
    if (dto.paidDate !== undefined) partial.paidDate = dto.paidDate ? new Date(dto.paidDate) : undefined;
    if (dto.installmentNumber !== undefined) partial.installmentNumber = dto.installmentNumber;
    if (dto.totalInstallments !== undefined) partial.totalInstallments = dto.totalInstallments;
    if (dto.monthlyAmount !== undefined) partial.monthlyAmount = dto.monthlyAmount;

    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

// Budgets
export function mapCreateBudgetDtoToBudget(dto: CreateBudgetDto, userId: ID): CreateBudget {
    const now = new Date();
    return {
        _id: randomUUID(),
        userId,
        categoryId: dto.categoryId,
        name: dto.name,
        limit: dto.limit,
        period: dto.period,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        color: dto.color,
        iconName: dto.iconName,
        createdAt: now,
        updatedAt: now,
    } as CreateBudget;
}

export function mapUpdateBudgetDtoToPartial(dto: UpdateBudgetDto): Partial<Budget> {
    const partial: Partial<Budget> = {};

    if (dto.categoryId !== undefined) partial.categoryId = dto.categoryId;
    if (dto.name !== undefined) partial.name = dto.name;
    if (dto.limit !== undefined) partial.limit = dto.limit;
    if (dto.period !== undefined) partial.period = dto.period;
    if (dto.startDate !== undefined) partial.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) partial.endDate = new Date(dto.endDate);
    if (dto.isActive !== undefined) partial.isActive = dto.isActive;
    if (dto.color !== undefined) partial.color = dto.color;
    if (dto.iconName !== undefined) partial.iconName = dto.iconName;

    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

// Goals
export function mapCreateGoalDtoToGoal(dto: CreateGoalDto, userId: ID): CreateGoal {
    const now = new Date();
    return {
        _id: randomUUID(),
        userId,
        name: dto.name,
        description: dto.description,
        targetAmount: dto.targetAmount,
        currentAmount: dto.currentAmount || 0,
        targetDate: new Date(dto.targetDate),
        priority: dto.priority || 'medium',
        category: dto.category,
        isCompleted: dto.isCompleted || false,
        completedDate: dto.completedDate ? new Date(dto.completedDate) : undefined,
        color: dto.color,
        iconName: dto.iconName,
        createdAt: now,
        updatedAt: now,
    } as CreateGoal;
}

export function mapUpdateGoalDtoToPartial(dto: UpdateGoalDto): Partial<Goal> {
    const partial: Partial<Goal> = {};

    if (dto.name !== undefined) partial.name = dto.name;
    if (dto.description !== undefined) partial.description = dto.description;
    if (dto.targetAmount !== undefined) partial.targetAmount = dto.targetAmount;
    if (dto.currentAmount !== undefined) partial.currentAmount = dto.currentAmount;
    if (dto.targetDate !== undefined) partial.targetDate = new Date(dto.targetDate);
    if (dto.priority !== undefined) partial.priority = dto.priority;
    if (dto.category !== undefined) partial.category = dto.category;
    if (dto.isCompleted !== undefined) partial.isCompleted = dto.isCompleted;
    if (dto.completedDate !== undefined)
        partial.completedDate = dto.completedDate ? new Date(dto.completedDate) : undefined;
    if (dto.color !== undefined) partial.color = dto.color;
    if (dto.iconName !== undefined) partial.iconName = dto.iconName;

    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

// Goal Deposits
export function mapCreateGoalDepositDtoToGoalDeposit(dto: CreateGoalDepositDto, userId: ID): CreateGoalDeposit {
    const now = new Date();
    return {
        _id: randomUUID(),
        userId,
        goalId: dto.goalId,
        amount: dto.amount,
        description: dto.description,
        depositDate: dto.depositDate ? new Date(dto.depositDate) : now,
        source: dto.source,
        createdAt: now,
        updatedAt: now,
    } as CreateGoalDeposit;
}

export function mapUpdateGoalDepositDtoToPartial(dto: UpdateGoalDepositDto): Partial<GoalDeposit> {
    const partial: Partial<GoalDeposit> = {};

    if (dto.goalId !== undefined) partial.goalId = dto.goalId;
    if (dto.amount !== undefined) partial.amount = dto.amount;
    if (dto.description !== undefined) partial.description = dto.description;
    if (dto.depositDate !== undefined) partial.depositDate = new Date(dto.depositDate);
    if (dto.source !== undefined) partial.source = dto.source;

    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

// Investments
export function mapCreateInvestmentDtoToInvestment(dto: CreateInvestmentDto, userId: ID): CreateInvestment {
    const now = new Date();
    const totalInvested = dto.quantity * dto.averagePrice;
    const currentValue = dto.currentPrice ? dto.quantity * dto.currentPrice : undefined;
    const profitability = currentValue ? currentValue - totalInvested : undefined;
    const profitabilityPercent = profitability ? (profitability / totalInvested) * 100 : undefined;

    return {
        _id: randomUUID(),
        userId,
        name: dto.name,
        type: dto.type,
        asset: dto.asset,
        quantity: dto.quantity,
        averagePrice: dto.averagePrice,
        totalInvested,
        currentPrice: dto.currentPrice,
        currentValue,
        profitability,
        profitabilityPercent,
        lastUpdated: dto.currentPrice ? now : undefined,
        broker: dto.broker,
        notes: dto.notes,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        color: dto.color,
        iconName: dto.iconName,
        createdAt: now,
        updatedAt: now,
    } as CreateInvestment;
}

export function mapUpdateInvestmentDtoToPartial(dto: UpdateInvestmentDto): Partial<Investment> {
    const partial: Partial<Investment> = {};

    if (dto.name !== undefined) partial.name = dto.name;
    if (dto.type !== undefined) partial.type = dto.type;
    if (dto.asset !== undefined) partial.asset = dto.asset;
    if (dto.quantity !== undefined) partial.quantity = dto.quantity;
    if (dto.averagePrice !== undefined) partial.averagePrice = dto.averagePrice;
    if (dto.currentPrice !== undefined) partial.currentPrice = dto.currentPrice;
    if (dto.broker !== undefined) partial.broker = dto.broker;
    if (dto.notes !== undefined) partial.notes = dto.notes;
    if (dto.isActive !== undefined) partial.isActive = dto.isActive;
    // if (dto.color !== undefined) partial.color = dto.color;
    // if (dto.iconName !== undefined) partial.iconName = dto.iconName;

    // Recalculate derived fields if relevant properties changed
    if (dto.quantity !== undefined || dto.averagePrice !== undefined || dto.currentPrice !== undefined) {
        const quantity = dto.quantity !== undefined ? dto.quantity : 0;
        const averagePrice = dto.averagePrice !== undefined ? dto.averagePrice : 0;
        const currentPrice = dto.currentPrice;

        partial.totalInvested = quantity * averagePrice;
        if (currentPrice !== undefined) {
            partial.currentValue = quantity * currentPrice;
            partial.profitability = partial.currentValue - partial.totalInvested;
            partial.profitabilityPercent = (partial.profitability / partial.totalInvested) * 100;
            partial.lastUpdated = new Date();
        }
    }

    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

// Investment Transactions
export function mapCreateInvestmentTransactionDtoToInvestmentTransaction(
    dto: CreateInvestmentTransactionDto,
    userId: ID,
): CreateInvestmentTransaction {
    const now = new Date();
    return {
        _id: randomUUID(),
        userId,
        investmentId: dto.investmentId,
        type: dto.type,
        quantity: dto.quantity,
        price: dto.price,
        totalValue: dto.quantity * dto.price,
        date: new Date(dto.date),
        fees: dto.fees,
        notes: dto.notes,
        createdAt: now,
        updatedAt: now,
    } as CreateInvestmentTransaction;
}

export function mapUpdateInvestmentTransactionDtoToPartial(
    dto: UpdateInvestmentTransactionDto,
): Partial<InvestmentTransaction> {
    const partial: Partial<InvestmentTransaction> = {};

    if (dto.investmentId !== undefined) partial.investmentId = dto.investmentId;
    if (dto.type !== undefined) partial.type = dto.type;
    if (dto.quantity !== undefined) partial.quantity = dto.quantity;
    if (dto.price !== undefined) partial.price = dto.price;
    if (dto.date !== undefined) partial.date = new Date(dto.date);
    if (dto.fees !== undefined) partial.fees = dto.fees;
    if (dto.notes !== undefined) partial.notes = dto.notes;

    // Recalculate total value if quantity or price changed
    if (dto.quantity !== undefined || dto.price !== undefined) {
        const quantity = dto.quantity !== undefined ? dto.quantity : 0;
        const price = dto.price !== undefined ? dto.price : 0;
        partial.totalValue = quantity * price;
    }

    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

// Subscriptions
export function mapCreateSubscriptionDtoToSubscription(dto: CreateSubscriptionDto, userId: ID): CreateSubscription {
    const now = new Date();
    const startDate = dto.startDate ? new Date(dto.startDate) : now;

    return {
        _id: randomUUID(),
        userId,
        planId: dto.planId,
        status: dto.status || 'trial',
        startDate,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        autoRenew: dto.autoRenew !== undefined ? dto.autoRenew : true,
        paymentMethod: dto.paymentMethod,
        lastPaymentDate: dto.lastPaymentDate ? new Date(dto.lastPaymentDate) : undefined,
        nextPaymentDate: dto.nextPaymentDate ? new Date(dto.nextPaymentDate) : undefined,
        amount: dto.amount,
        currency: dto.currency || 'BRL',
        features: dto.features || [],
        createdAt: now,
        updatedAt: now,
    } as CreateSubscription;
}

export function mapUpdateSubscriptionDtoToPartial(dto: UpdateSubscriptionDto): Partial<Subscription> {
    const partial: Partial<Subscription> = {};

    if (dto.planId !== undefined) partial.planId = dto.planId;
    if (dto.status !== undefined) partial.status = dto.status;
    if (dto.startDate !== undefined) partial.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) partial.endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    if (dto.autoRenew !== undefined) partial.autoRenew = dto.autoRenew;
    if (dto.paymentMethod !== undefined) partial.paymentMethod = dto.paymentMethod;
    if (dto.lastPaymentDate !== undefined)
        partial.lastPaymentDate = dto.lastPaymentDate ? new Date(dto.lastPaymentDate) : undefined;
    if (dto.nextPaymentDate !== undefined)
        partial.nextPaymentDate = dto.nextPaymentDate ? new Date(dto.nextPaymentDate) : undefined;
    if (dto.amount !== undefined) partial.amount = dto.amount;
    if (dto.currency !== undefined) partial.currency = dto.currency;
    if (dto.features !== undefined) partial.features = dto.features;

    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

// Plans
export function mapCreatePlanDtoToPlan(dto: CreatePlanDto): CreatePlan {
    const now = new Date();
    return {
        _id: randomUUID(),
        name: dto.name,
        description: dto.description,
        price: dto.price,
        currency: dto.currency || 'BRL',
        interval: dto.interval,
        features: dto.features,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        maxUsers: dto.maxUsers,
        trialDays: dto.trialDays || 0,
        createdAt: now,
        updatedAt: now,
    } as CreatePlan;
}

export function mapUpdatePlanDtoToPartial(dto: UpdatePlanDto): Partial<Plan> {
    const partial: Partial<Plan> = {};

    if (dto.name !== undefined) partial.name = dto.name;
    if (dto.description !== undefined) partial.description = dto.description;
    if (dto.price !== undefined) partial.price = dto.price;
    if (dto.currency !== undefined) partial.currency = dto.currency;
    if (dto.interval !== undefined) partial.interval = dto.interval;
    if (dto.features !== undefined) partial.features = dto.features;
    if (dto.isActive !== undefined) partial.isActive = dto.isActive;
    if (dto.maxUsers !== undefined) partial.maxUsers = dto.maxUsers;
    if (dto.trialDays !== undefined) partial.trialDays = dto.trialDays;

    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}

// Store Preferences
export type CreateStorePreference = StorePreference;

export function mapCreateStorePreferenceDtoToStorePreference(
    dto: CreateStorePreferenceDto,
    familyId: ID,
): CreateStorePreference {
    const now = new Date();
    return {
        _id: randomUUID(),
        familyId,
        storeId: dto.storeId,
        preference: dto.preference,
        purchaseCount: 0,
        createdAt: now,
        updatedAt: now,
    } as CreateStorePreference;
}

export function mapUpdateStorePreferenceDtoToPartial(dto: UpdateStorePreferenceDto): Partial<StorePreference> {
    const partial: Partial<StorePreference> = {};

    if (dto.preference !== undefined) partial.preference = dto.preference;

    if (Object.keys(partial).length) partial.updatedAt = new Date();
    return partial;
}
