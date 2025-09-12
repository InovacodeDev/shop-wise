/**
 * TypeScript types for API service responses
 * These types define the expected return types for all API endpoints
 */
import { AnalyzeConsumptionDataOutput, ExtractProductDataOutput, SuggestMissingItemsOutput } from './ai-flows';

// ===============================
// Base Types
// ===============================

export interface BaseEntity {
    _id: string;
    createdAt?: string;
    updatedAt?: string;
}

// ===============================
// User Types
// ===============================

export interface User extends BaseEntity {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    emailVerified?: boolean;
    disabled?: boolean;
    customClaims?: Record<string, any>;
    familyId?: string | { id: string };
    settings?: Record<string, any>;
    isAdmin?: boolean;
    plan?: string;
    planExpirationDate?: string;
}

export interface CreateUserRequest {
    email: string;
    password?: string;
    displayName?: string;
    photoURL?: string;
    emailVerified?: boolean;
    disabled?: boolean;
}

export interface UpdateUserRequest {
    email?: string;
    displayName?: string;
    photoURL?: string;
    emailVerified?: boolean;
    disabled?: boolean;
    settings?: Record<string, any>;
}

// ===============================
// Family Types
// ===============================

export interface Family extends BaseEntity {
    name: string;
    members: string[]; // User IDs
    ownerId: string;
    familyComposition?: any;
    plan: 'free' | 'premium';
    settings?: {
        currency?: string;
        timezone?: string;
        notifications?: boolean;
    };
}

export interface CreateFamilyRequest {
    name: string;
    members?: string[];
    settings?: Family['settings'];
}

export interface UpdateFamilyRequest {
    name?: string;
    members?: string[];
    familyComposition?: any;
    settings?: Family['settings'];
}

// ===============================
// Product Types
// ===============================

export interface Product extends BaseEntity {
    id?: string; // Some components expect id instead of _id
    name: string;
    barcode?: string;
    brand?: string;
    category: string;
    subcategory?: string;
    description?: string;
    imageUrl?: string;
    averagePrice?: number;
    unit?: string; // UN, KG, L, etc.
    volume?: string;
}

export interface CreateProductRequest {
    name: string;
    barcode?: string;
    brand?: string;
    category: string;
    subcategory?: string;
    description?: string;
    imageUrl?: string;
    averagePrice?: number;
    unit?: string;
    volume?: string;
}

// ===============================
// Store Types
// ===============================

export interface Store extends BaseEntity {
    name: string;
    cnpj?: string;
    address?: string;
    location?: {
        latitude: number | null;
        longitude: number | null;
    };
    type?: string;
}

export interface CreateStoreRequest {
    name: string;
    cnpj?: string;
    address?: string;
    location?: {
        latitude: number | null;
        longitude: number | null;
    };
    type?: string;
}

// ===============================
// Store Preference Types
// ===============================

export type StorePreferenceType = 'favorite' | 'ignored' | 'neutral';

export interface StorePreference extends BaseEntity {
    familyId: string;
    storeId: string;
    preference: StorePreferenceType;
    purchaseCount: number;
    lastPurchaseDate: string;
    notes?: string;
}

export interface CreateStorePreferenceRequest {
    storeId: string;
    preference: StorePreferenceType;
    notes?: string;
}

export interface UpdateStorePreferenceRequest {
    preference?: StorePreferenceType;
    notes?: string;
}

// ===============================
// Category Types
// ===============================

export interface Category extends BaseEntity {
    name: string;
    description?: string;
    parentId?: string;
    color?: string;
    icon?: string;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
    parentId?: string;
    color?: string;
    icon?: string;
}

// ===============================
// Purchase Types
// ===============================

export interface Purchase extends BaseEntity {
    id?: string; // Some components expect id instead of _id
    familyId: string;
    storeId: string;
    storeName: string;
    date: string;
    totalAmount: number;
    discount?: number;
    accessKey?: string | null;
    items?: PurchaseItem[];
}

export interface CreatePurchaseRequest {
    storeId: string;
    storeName: string;
    date: string;
    totalAmount: number;
    discount?: number;
    accessKey?: string | null;
}

export interface UpdatePurchaseRequest {
    storeId?: string;
    storeName?: string;
    date?: string;
    totalAmount?: number;
    discount?: number;
    accessKey?: string;
}

// ===============================
// Monthly Purchase Group Types
// ===============================

export interface MonthlyPurchaseGroup {
    /** Month and year in YYYY-MM format for sorting (e.g., "2024-01") */
    monthYear: string;
    /** Human-readable month and year for display (e.g., "January 2024") */
    displayName: string;
    /** Total amount spent for all purchases in this month */
    totalAmount: number;
    /** Number of purchases in this month */
    purchaseCount: number;
    /** Array of purchases for this month, sorted by date descending */
    purchases: Purchase[];
}

/**
 * Represents a month/year that has purchase data available
 * Used for insights, filtering, and analytics features
 */
export interface AvailableMonth {
    /** Month/year key in YYYY-MM format or 'no-date' for purchases without dates */
    monthYear: string;

    /** Human-readable display name (e.g., "January 2024" or "No Date") */
    displayName: string;

    /** Total number of purchases in this month */
    purchaseCount: number;

    /** Total amount spent in this month */
    totalAmount: number;

    /** Date of the earliest purchase in this month (null for no-date category) */
    earliestPurchase: string | null;

    /** Date of the latest purchase in this month (null for no-date category) */
    latestPurchase: string | null;
}

/**
 * Summary statistics for available months
 * Useful for insights and analytics dashboards
 */
export interface AvailableMonthsSummary {
    /** Total number of months with purchase data */
    totalMonths: number;

    /** Total number of purchases across all months */
    totalPurchases: number;

    /** Total amount spent across all months */
    totalAmount: number;

    /** Average purchases per month */
    averagePurchasesPerMonth: number;

    /** Average amount spent per month */
    averageAmountPerMonth: number;

    /** Earliest month with purchase data */
    earliestMonth: string | null;

    /** Latest month with purchase data */
    latestMonth: string | null;

    /** Month with the highest spending */
    highestSpendingMonth: AvailableMonth | null;

    /** Month with the most purchases */
    mostActiveMonth: AvailableMonth | null;
}

// ===============================
// Purchase Item Types
// ===============================

export interface PurchaseItem extends BaseEntity {
    id?: string; // Some components expect id instead of _id
    purchaseId: string;
    productId?: string | null;
    name?: string;
    quantity: number;
    price: number;
    unitPrice?: number;
    barcode?: string;
    category?: string;
    meta?: Record<string, unknown>;
    // Additional fields used in components
    totalPrice?: number;
    purchaseDate?: string;
    storeName?: string;
    productName?: string;
    productBarcode?: string;
    productVolume?: string;
    productBrand?: string;
    productCategory?: string;
    productSubcategory?: string;
}

// Extracted item from OCR/AI or external sources (based on screenshot structure)
export interface ExtractedPurchaseItem {
    productId?: string;
    name: string;
    description?: string | null;
    barcode?: string | null;
    brand?: string | null;
    category?: string | null;
    subCategory?: string | null; // matches input example
    unit?: string | null; // e.g., "un"
    quantity: number;
    price: number; // unit price
    total: number; // total = quantity * price
}

export type PurchaseItemExtracted = ExtractedPurchaseItem;

export interface CreatePurchaseItemRequest {
    productId?: string | null;
    name?: string;
    quantity: number;
    total: number;
    price: number;
    barcode?: string;
    category?: string;
    meta?: Record<string, unknown>;
}

export interface UpdatePurchaseItemRequest {
    productId?: string | null;
    name?: string;
    quantity?: number;
    price?: number;
    unitPrice?: number;
    barcode?: string;
    category?: string;
    meta?: Record<string, unknown>;
}

export interface BulkUpdatePurchaseItemsRequest {
    items: CreatePurchaseItemRequest[];
}

export interface BulkUpdatePurchaseItemsResponse {
    success: boolean;
    itemsCreated?: number;
    itemsUpdated?: number;
    errors?: string[];
}

export interface BulkDeletePurchaseItemsRequest {
    itemIds: string[];
}

export interface BulkDeletePurchaseItemsResponse {
    success: boolean;
    itemsDeleted?: number;
    errors?: string[];
}

// ===============================
// Pantry Item Types
// ===============================

export interface PantryItem extends BaseEntity {
    familyId: string;
    productId?: string;
    name: string;
    quantity: number;
    unit?: string;
    expirationDate?: string;
    location?: string;
    notes?: string;
}

export interface CreatePantryItemRequest {
    productId?: string;
    name: string;
    quantity: number;
    unit?: string;
    expirationDate?: string;
    location?: string;
    notes?: string;
}

export interface UpdatePantryItemRequest {
    productId?: string;
    name?: string;
    quantity?: number;
    unit?: string;
    expirationDate?: string;
    location?: string;
    notes?: string;
}

// ===============================
// Shopping List Types
// ===============================

export interface ShoppingList extends BaseEntity {
    id?: string; // Some components expect id instead of _id
    familyId: string;
    name: string;
    description?: string;
    isActive?: boolean;
    status?: string; // Used in components
    createdBy?: string; // Used in components
    items?: ShoppingListItem[];
}

export interface CreateShoppingListRequest {
    listName: string;
    familySize: number;
    preferences?: string;
}

export interface UpdateShoppingListRequest {
    name?: string;
    description?: string;
    isActive?: boolean;
}

// ===============================
// Shopping List Item Types
// ===============================

export interface ShoppingListItem extends BaseEntity {
    id?: string; // Some components expect id instead of _id
    listId: string;
    productId?: string;
    name: string;
    quantity: number;
    unit?: string;
    isCompleted?: boolean;
    checked?: boolean; // Used in components
    notes?: string;
    estimatedPrice?: number;
}

export interface CreateShoppingListItemRequest {
    productId?: string;
    name: string;
    quantity: number;
    unit?: string;
    isCompleted?: boolean;
    checked?: boolean;
    notes?: string;
    estimatedPrice?: number;
}

export interface UpdateShoppingListItemRequest {
    productId?: string;
    name?: string;
    quantity?: number;
    unit?: string;
    isCompleted?: boolean;
    checked?: boolean;
    notes?: string;
    estimatedPrice?: number;
}

// ===============================
// Notification Types
// ===============================

export interface Notification extends BaseEntity {
    familyId: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    isRead?: boolean;
    actionUrl?: string;
    metadata?: Record<string, any>;
}

export interface CreateNotificationRequest {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    actionUrl?: string;
    metadata?: Record<string, any>;
}

export interface MarkNotificationAsReadResponse {
    success: boolean;
    notificationId: string;
}

export interface MarkAllNotificationsAsReadResponse {
    success: boolean;
    markedCount: number;
}

// ===============================
// Auth Types
// ===============================

export interface AuthResponse {
    token: string;
    refresh?: string;
    user?: User;
    uid?: string;
}

export interface SignUpRequest {
    email: string;
    password: string;
    displayName?: string;
}

export interface SignInRequest {
    email: string;
    password: string;
    totp?: string;
}

export interface MeResponse {
    user: {
        uid: string;
        email: string;
        displayName?: string;
        photoURL?: string;
    };
}

export interface RefreshTokenRequest {
    token?: string;
}

export interface RefreshTokenResponse {
    token: string;
    refresh?: string;
}

export interface RevokeTokenResponse {
    success: boolean;
}

// ===============================
// AI Flow Types (re-exported for convenience)
// ===============================

export interface AnalyzeConsumptionRequest {
    consumptionData: string;
    language?: string;
}

export interface ExtractDataFromPdfRequest {
    pdfDataUri: string;
}

export interface ExtractDataFromPageRequest {
    pageDataUri: string;
}

export interface ExtractProductDataRequest {
    receiptImage: string;
}

export interface SuggestMissingItemsRequest {
    purchaseHistory: string;
    familySize: number;
}

// Re-export AI flow output types
export type { ExtractProductDataOutput, AnalyzeConsumptionDataOutput, SuggestMissingItemsOutput } from './ai-flows';

// ===============================
// Generic API Response Types
// ===============================

export interface ApiError {
    message: string;
    status?: number;
    code?: string;
    details?: any;
}

export interface DeleteResponse {
    success: boolean;
    deletedId: string;
}

export interface BulkOperationResponse {
    success: boolean;
    processed: number;
    errors?: string[];
}

// ================================
// Finance Types
// ================================

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'other';

export interface Expense extends BaseEntity {
    userId: string;
    categoryId: string;
    category?: Category;
    amount: number;
    date: string;
    paymentMethod: PaymentMethod;
    description?: string;
    accountId?: string;
    tags?: string[];
    isRecurring?: boolean;
    recurringId?: string;
}

export interface Account extends BaseEntity {
    userId: string;
    name: string;
    currentBalance: number;
    type: 'checking' | 'savings' | 'wallet' | 'investment' | 'credit_card' | 'other';
    institution?: string;
    accountNumber?: string;
    isActive: boolean;
    color?: string;
    iconName?: string;
}

export interface AccountSummary {
    totalBalance: number;
    accountsCount: number;
    accountsByType: Record<Account['type'], number>;
    recentTransactions: Array<{
        accountId: string;
        accountName: string;
        type: 'credit' | 'debit';
        amount: number;
        description: string;
        date: string;
    }>;
}

// Investment types
export interface Investment extends BaseEntity {
    userId: string;
    name: string;
    type: 'stocks' | 'bonds' | 'funds' | 'crypto' | 'real_estate' | 'other';
    asset: string;
    quantity: number;
    averagePrice: number;
    totalInvested: number;
    currentPrice?: number;
    currentValue?: number;
    profitability?: number;
    profitabilityPercent?: number;
    lastUpdated?: string;
    broker?: string;
    notes?: string;
    isActive: boolean;
}

export interface InvestmentTransaction extends BaseEntity {
    userId: string;
    investmentId: string;
    type: 'buy' | 'sell' | 'dividend' | 'interest' | 'bonus';
    quantity: number;
    price: number;
    totalValue: number;
    date: string;
    fees?: number;
    notes?: string;
}

export interface InvestmentSummary {
    totalInvested: number;
    currentValue: number;
    totalProfitability: number;
    totalProfitabilityPercent: number;
    investmentsByType: Record<
        Investment['type'],
        {
            count: number;
            invested: number;
            currentValue: number;
            profitability: number;
        }
    >;
    topPerformers: Array<{
        investmentId: string;
        name: string;
        profitabilityPercent: number;
        profitability: number;
    }>;
    recentTransactions: Array<{
        investmentName: string;
        type: InvestmentTransaction['type'];
        amount: number;
        date: string;
    }>;
}

export interface InvestmentPortfolio {
    userId: string;
    summary: InvestmentSummary;
    investments: Investment[];
    monthlyEvolution: Array<{
        month: string;
        totalValue: number;
        totalInvested: number;
    }>;
}

// Subscription types
export interface Plan extends BaseEntity {
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
    code: string;
    isEnabled: boolean;
}

export interface Subscription extends BaseEntity {
    userId: string;
    planId: string;
    status: 'active' | 'canceled' | 'expired' | 'trial' | 'past_due';
    startDate: string;
    endDate?: string;
    autoRenew: boolean;
    paymentMethod?: string;
    lastPaymentDate?: string;
    nextPaymentDate?: string;
    amount: number;
    currency: string;
    features: string[];
}

export type FeatureCode =
    | 'basic_finances'
    | 'advanced_finances'
    | 'investments'
    | 'gamification'
    | 'education'
    | 'offline_sync'
    | 'bank_integration'
    | 'advanced_reports'
    | 'unlimited_storage'
    | 'priority_support';

export interface UserFeatures {
    userId: string;
    features: Record<FeatureCode, boolean>;
    subscription?: {
        planId: string;
        planName: string;
        status: Subscription['status'];
        endDate?: string;
    };
}

// Credit Card types
export interface CreditCard extends BaseEntity {
    userId: string;
    name: string;
    lastFourDigits: string;
    cardType: 'visa' | 'mastercard' | 'amex' | 'elo' | 'other';
    creditLimit: number;
    currentBalance: number;
    availableLimit: number;
    dueDay: number;
    closingDay: number;
    isActive: boolean;
    color?: string;
    iconName?: string;
}

export interface CreditTransaction extends BaseEntity {
    userId: string;
    cardId: string;
    expenseId?: string;
    amount: number;
    description: string;
    transactionDate: string;
    dueDate: string;
    isPaid: boolean;
    paidDate?: string;
    installmentNumber?: number;
    totalInstallments?: number;
    monthlyAmount?: number;
}

export interface CreditCardInvoice {
    cardId: string;
    cardName: string;
    invoiceMonth: string;
    totalAmount: number;
    dueDate: string;
    closingDate: string;
    transactions: CreditTransaction[];
    isPaid: boolean;
    paidDate?: string;
}

// Budget types
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Budget extends BaseEntity {
    userId: string;
    categoryId?: string;
    name: string;
    limit: number;
    period: BudgetPeriod;
    startDate: string;
    endDate: string;
    isActive: boolean;
    color?: string;
    iconName?: string;
}

export interface BudgetProgress {
    budgetId: string;
    name: string;
    limit: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
    period: BudgetPeriod;
    startDate: string;
    endDate: string;
    alertStatus: 'none' | 'warning' | 'danger';
}

// Goal types
export interface Goal extends BaseEntity {
    userId: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    priority: 'low' | 'medium' | 'high';
    categoryId?: string;
    isActive: boolean;
    color?: string;
    iconName?: string;
}

export interface GoalDeposit extends BaseEntity {
    userId: string;
    goalId: string;
    amount: number;
    depositDate: string;
    description?: string;
    sourceAccount?: string;
}

export interface GoalProgress {
    goalId: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    progressPercentage: number;
    remainingAmount: number;
    daysRemaining: number;
    targetDate: string;
    status: 'on_track' | 'behind' | 'achieved';
}

// Recurring Transaction types (for projections)
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringTransaction extends BaseEntity {
    userId: string;
    name: string;
    amount: number;
    frequency: RecurringFrequency;
    startDate: string;
    endDate?: string;
    categoryId?: string;
    accountId?: string;
    paymentMethod: PaymentMethod;
    description?: string;
    isActive: boolean;
    nextDueDate: string;
}

// Balance Projection types
export interface BalanceProjection {
    userId: string;
    projectionPeriod: '3months' | '6months' | '1year';
    currentBalance: number;
    projectedBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    recurringTransactions: RecurringTransaction[];
    projections: Array<{
        date: string;
        balance: number;
        income: number;
        expenses: number;
        description: string;
    }>;
    alerts: Array<{
        type: 'warning' | 'danger';
        message: string;
        projectedDate: string;
    }>;
}

// Bank Integration types
export interface BankAccount extends BaseEntity {
    userId: string;
    bankName: string;
    accountNumber: string;
    accountType: 'checking' | 'savings';
    balance: number;
    lastSync: string;
    isActive: boolean;
}

export interface BankTransaction extends BaseEntity {
    bankAccountId: string;
    userId: string;
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
    category?: string;
    isCategorized: boolean;
}

// Gamification types
export interface Achievement extends BaseEntity {
    userId: string;
    name: string;
    description: string;
    iconName: string;
    category: 'saving' | 'spending' | 'investment' | 'goal' | 'streak';
    points: number;
    unlockedAt: string;
}

export interface UserStats {
    userId: string;
    totalPoints: number;
    achievementsUnlocked: number;
    currentStreak: number;
    longestStreak: number;
    totalSaved: number;
    totalInvested: number;
    goalsAchieved: number;
    monthlySpending: number;
}

// Education types
export interface EducationalContent extends BaseEntity {
    title: string;
    content: string;
    category: 'saving' | 'investing' | 'budgeting' | 'debt' | 'general';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedReadTime: number;
    tags: string[];
    isPremium: boolean;
}

export interface UserProgress extends BaseEntity {
    userId: string;
    contentId: string;
    isRead: boolean;
    isBookmarked: boolean;
    readAt?: string;
    bookmarkedAt?: string;
}

// Finance Analytics types
export interface ExpensesSummary {
    totalExpenses: number;
    categories: Array<{
        categoryId: string;
        categoryName: string;
        totalAmount: number;
        percentage: number;
    }>;
    monthlyTrend: Array<{
        month: string;
        totalAmount: number;
    }>;
}

export interface ExpenseFilters {
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: PaymentMethod;
    accountId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// ===============================
// Payment Types
// ===============================

export interface CreateCheckoutRequest {
    products: string[];
    customerId?: string;
    customerEmail?: string;
    successUrl?: string;
    metadata?: Record<string, any>;
    customerBillingAddress?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country: string;
    };
}

export interface CheckoutResponse {
    id: string;
    url?: string;
    status: string;
    amount?: number;
    currency?: string;
    expiresAt?: string;
    createdAt: string;
    metadata?: Record<string, any>;
}

export interface PaymentStatusResponse {
    transactionId: string;
    polarCheckoutId: string;
    status: string;
    amount: number;
    currency: string;
    productId?: string;
    customerId?: string;
    checkoutUrl?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    expiresAt?: string;
    metadata?: Record<string, any>;
}

export interface UserPaymentListResponse {
    payments: PaymentStatusResponse[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export interface PaymentListParams {
    status?: string;
    limit?: number;
    page?: number;
}

export interface PollStatusResponse {
    isPolling: boolean;
    pollIntervalMs: number;
    maxRetries: number;
    pollingTimeoutMs: number;
}
