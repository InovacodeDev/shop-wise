import { CreateExpenseDto } from '@/expenses/dto/create-expense.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CategoriesService } from '../categories/categories.service';
import { ExpensesService } from '../expenses/expenses.service';
import { AvailableMonth, AvailableMonthsSummary } from '../models/available-month';
import {
    MONTHLY_GROUPING_CONSTANTS,
    MonthlyGroupingOptions,
    MonthlyPurchaseGroup,
} from '../models/monthly-purchase-group';
import { Purchase } from '../models/purchase';
import { StorePreferencesService } from '../stores/store-preferences.service';
import { DateUtil } from '../utils/date.util';
import { mapCreatePurchaseDtoToPurchase, mapUpdatePurchaseDtoToPartial } from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { MonthlyPurchasesCacheService } from './cache/monthly-purchases-cache.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PurchaseDocument } from './schemas/purchase.schema';

type LeanPurchase = Omit<PurchaseDocument, 'save' | 'toObject' | 'id'> & { _id?: string };

@Injectable()
export class PurchasesService {
    constructor(
        @InjectModel('Purchase') private readonly purchaseModel: Model<PurchaseDocument>,
        private readonly cacheService: MonthlyPurchasesCacheService,
        private readonly expensesService: ExpensesService,
        private readonly categoriesService: CategoriesService,
        private readonly storePreferencesService: StorePreferencesService,
    ) {}

    async create(familyId: string, createPurchaseDto: CreatePurchaseDto, userId: string): Promise<Purchase> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(userId);
        const doc = mapCreatePurchaseDtoToPurchase(createPurchaseDto, familyId, userId);
        const created = await this.purchaseModel.create(doc as unknown as PurchaseDocument);

        // Invalidate cache when new purchase is created
        this.cacheService.invalidate(familyId);

        // Update store preferences automatically (mark as favorite or update stats)
        try {
            if (createPurchaseDto.storeId && createPurchaseDto.date) {
                await this.storePreferencesService.updatePurchaseStats(
                    familyId,
                    createPurchaseDto.storeId,
                    new Date(createPurchaseDto.date),
                );
            }
        } catch (error) {
            // Don't fail the purchase creation if store preferences update fails
            console.warn('Failed to update store preferences:', error);
        }

        return (await this.purchaseModel.findById(created._id).lean<LeanPurchase>().exec()) as unknown as Purchase;
    }

    async findAll(familyId: string): Promise<Purchase[]> {
        UuidUtil.validateUuid(familyId);
        return (await this.purchaseModel.find({ familyId }).lean<LeanPurchase>().exec()) as unknown as Purchase[];
    }

    async findOne(familyId: string, id: string): Promise<Purchase> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(id);
        const doc = (await this.purchaseModel
            .findOne({ familyId, _id: id })
            .lean<LeanPurchase>()
            .exec()) as Purchase | null;
        if (!doc)
            throw new NotFoundException(`Purchase with ID "${String(id)}" not found in family "${String(familyId)}"`);
        return doc;
    }

    async update(familyId: string, id: string, updatePurchaseDto: UpdatePurchaseDto): Promise<Purchase> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(id);
        const doc = (await this.purchaseModel
            .findOne({ familyId, _id: id })
            .lean<LeanPurchase>()
            .exec()) as Purchase | null;
        if (!doc) {
            throw new NotFoundException(`Purchase with ID "${String(id)}" not found in family "${String(familyId)}"`);
        }

        const updatedFields = mapUpdatePurchaseDtoToPartial(updatePurchaseDto);

        await this.purchaseModel.updateOne({ familyId, _id: id }, { $set: updatedFields }).exec();

        // Invalidate cache when purchase is updated
        this.cacheService.invalidate(familyId);

        return (await this.purchaseModel
            .findOne({ familyId, _id: id })
            .lean<LeanPurchase>()
            .exec()) as unknown as Purchase;
    }

    async remove(familyId: string, id: string): Promise<Purchase> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(id);
        const doc = (await this.purchaseModel
            .findOne({ familyId, _id: id })
            .lean<LeanPurchase>()
            .exec()) as unknown as Purchase | null;
        if (!doc)
            throw new NotFoundException(`Purchase with ID "${String(id)}" not found in family "${String(familyId)}"`);
        await this.purchaseModel.deleteOne({ familyId, _id: id }).exec();

        // Invalidate cache when purchase is deleted
        this.cacheService.invalidate(familyId);

        return doc;
    }

    /**
     * Finds all purchases for a family grouped by month and year
     * @param familyId - The family ID to find purchases for
     * @param options - Optional configuration for grouping behavior
     * @returns Array of monthly purchase groups sorted by month descending
     */
    async findAllByMonth(
        familyId: string,
        options: MonthlyGroupingOptions = MONTHLY_GROUPING_CONSTANTS.DEFAULT_OPTIONS,
    ): Promise<MonthlyPurchaseGroup[]> {
        try {
            UuidUtil.validateUuid(familyId);

            // Check cache first
            const cachedResult = this.cacheService.get(familyId);
            if (cachedResult) {
                return cachedResult;
            }

            // Get all purchases for the family
            const purchases = await this.findAll(familyId);

            // Group purchases by month
            const result = this.groupPurchasesByMonth(purchases, options);

            // Cache the result
            this.cacheService.set(familyId, result);

            return result;
        } catch (error) {
            // Log the error for debugging while preserving the original error for the caller
            console.error(`Error in findAllByMonth for family ${familyId}:`, error);

            // Re-throw the error to maintain existing behavior
            throw error;
        }
    }

    /**
     * Groups an array of purchases by month and year
     * @param purchases - Array of purchases to group
     * @param options - Configuration options for grouping
     * @returns Array of monthly purchase groups
     */
    private groupPurchasesByMonth(
        purchases: Purchase[],
        options: MonthlyGroupingOptions = MONTHLY_GROUPING_CONSTANTS.DEFAULT_OPTIONS,
    ): MonthlyPurchaseGroup[] {
        // Create a map to group purchases by month key
        const monthGroups = new Map<string, Purchase[]>();

        // Group purchases by month
        for (const purchase of purchases) {
            const monthKey = DateUtil.getMonthKeyForDate(purchase.date);

            if (!monthGroups.has(monthKey)) {
                monthGroups.set(monthKey, []);
            }
            monthGroups.get(monthKey)!.push(purchase);
        }

        // Convert map to array of MonthlyPurchaseGroup objects
        const groups: MonthlyPurchaseGroup[] = [];

        for (const [monthKey, monthPurchases] of monthGroups.entries()) {
            // Sort purchases within the month
            const sortedPurchases = this.sortPurchasesWithinMonth(monthPurchases, options.purchaseSortOrder);

            // Calculate summary statistics
            const summary = this.calculateMonthlySummary(sortedPurchases);

            // Create the group object
            const group: MonthlyPurchaseGroup = {
                monthYear: monthKey,
                displayName: this.getDisplayNameForMonthKey(monthKey),
                totalAmount: summary.totalAmount,
                purchaseCount: summary.purchaseCount,
                purchases: sortedPurchases,
            };

            groups.push(group);
        }

        // Sort groups by month
        return this.sortMonthlyGroups(groups, options.sortOrder);
    }

    /**
     * Sorts purchases within a month by date
     * @param purchases - Array of purchases to sort
     * @param order - Sort order ('asc' or 'desc')
     * @returns Sorted array of purchases
     */
    private sortPurchasesWithinMonth(purchases: Purchase[], order: 'asc' | 'desc' = 'desc'): Purchase[] {
        return [...purchases].sort((a, b) => DateUtil.compareDates(a.date, b.date, order));
    }

    /**
     * Calculates summary statistics for a group of purchases
     * @param purchases - Array of purchases to summarize
     * @returns Summary object with total amount and purchase count
     */
    private calculateMonthlySummary(purchases: Purchase[]): { totalAmount: number; purchaseCount: number } {
        let totalAmount = 0;

        for (const purchase of purchases) {
            if (typeof purchase.totalAmount === 'number' && !isNaN(purchase.totalAmount)) {
                totalAmount += purchase.totalAmount;
            }
        }

        return {
            totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
            purchaseCount: purchases.length,
        };
    }

    /**
     * Gets the display name for a month key
     * @param monthKey - The month key (e.g., "2024-01" or "no-date")
     * @returns Human-readable display name
     */
    private getDisplayNameForMonthKey(monthKey: string): string {
        if (monthKey === MONTHLY_GROUPING_CONSTANTS.NO_DATE_KEY) {
            return MONTHLY_GROUPING_CONSTANTS.NO_DATE_DISPLAY;
        }

        // Parse the month key (format: YYYY-MM)
        const [yearStr, monthStr] = monthKey.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);

        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
            return 'Invalid Date';
        }

        const monthName = MONTHLY_GROUPING_CONSTANTS.MONTH_NAMES[month - 1];
        return `${monthName} ${year}`;
    }

    /**
     * Sorts monthly groups by month key
     * @param groups - Array of monthly groups to sort
     * @param order - Sort order ('asc' or 'desc')
     * @returns Sorted array of monthly groups
     */
    private sortMonthlyGroups(groups: MonthlyPurchaseGroup[], order: 'asc' | 'desc' = 'desc'): MonthlyPurchaseGroup[] {
        return [...groups].sort((a, b) => DateUtil.compareMonthKeys(a.monthYear, b.monthYear, order));
    }

    /**
     * Gets all available months/years that have purchases for insights and filtering
     * @param familyId - The family ID to get available months for
     * @returns Array of month/year objects with metadata for insights
     */
    async getAvailableMonths(familyId: string): Promise<AvailableMonth[]> {
        try {
            UuidUtil.validateUuid(familyId);

            // Get all purchases for the family
            const purchases = await this.findAll(familyId);

            if (purchases.length === 0) {
                return [];
            }

            // Create a map to collect unique months with metadata
            const monthsMap = new Map<string, AvailableMonth>();

            // Process each purchase to extract month information
            for (const purchase of purchases) {
                const monthKey = DateUtil.getMonthKeyForDate(purchase.date);

                if (!monthsMap.has(monthKey)) {
                    monthsMap.set(monthKey, {
                        monthYear: monthKey,
                        displayName: this.getDisplayNameForMonthKey(monthKey),
                        purchaseCount: 0,
                        totalAmount: 0,
                        earliestPurchase: purchase.date ? purchase.date.toISOString() : null,
                        latestPurchase: purchase.date ? purchase.date.toISOString() : null,
                    });
                }

                const monthData = monthsMap.get(monthKey)!;
                monthData.purchaseCount++;
                monthData.totalAmount += purchase.totalAmount || 0;

                // Update earliest and latest purchase dates
                if (purchase.date) {
                    const purchaseDateStr = purchase.date.toISOString();
                    if (
                        !monthData.earliestPurchase ||
                        new Date(purchaseDateStr) < new Date(monthData.earliestPurchase)
                    ) {
                        monthData.earliestPurchase = purchaseDateStr;
                    }
                    if (!monthData.latestPurchase || new Date(purchaseDateStr) > new Date(monthData.latestPurchase)) {
                        monthData.latestPurchase = purchaseDateStr;
                    }
                }
            }

            // Convert map to array and round total amounts
            const availableMonths = Array.from(monthsMap.values()).map((month) => ({
                ...month,
                totalAmount: Math.round(month.totalAmount * 100) / 100,
            }));

            // Sort by month descending (newest first)
            return availableMonths.sort((a, b) => DateUtil.compareMonthKeys(a.monthYear, b.monthYear, 'desc'));
        } catch (error) {
            console.error(`Error in getAvailableMonths for family ${familyId}:`, error);
            throw error;
        }
    }

    /**
     * Gets summary statistics for all available months
     * @param familyId - The family ID to get summary for
     * @returns Summary statistics object with insights data
     */
    async getAvailableMonthsSummary(familyId: string): Promise<AvailableMonthsSummary> {
        try {
            UuidUtil.validateUuid(familyId);

            const availableMonths = await this.getAvailableMonths(familyId);

            if (availableMonths.length === 0) {
                return {
                    totalMonths: 0,
                    totalPurchases: 0,
                    totalAmount: 0,
                    averagePurchasesPerMonth: 0,
                    averageAmountPerMonth: 0,
                    earliestMonth: null,
                    latestMonth: null,
                    highestSpendingMonth: null,
                    mostActiveMonth: null,
                };
            }

            // Calculate totals
            const totalPurchases = availableMonths.reduce((sum, month) => sum + month.purchaseCount, 0);
            const totalAmount = availableMonths.reduce((sum, month) => sum + month.totalAmount, 0);

            // Find months with highest spending and most purchases
            const highestSpendingMonth = availableMonths.reduce((max, month) =>
                month.totalAmount > max.totalAmount ? month : max,
            );
            const mostActiveMonth = availableMonths.reduce((max, month) =>
                month.purchaseCount > max.purchaseCount ? month : max,
            );

            // Get earliest and latest months (excluding 'no-date')
            const monthsWithDates = availableMonths.filter(
                (month) => month.monthYear !== MONTHLY_GROUPING_CONSTANTS.NO_DATE_KEY,
            );
            const sortedMonths = monthsWithDates.sort((a, b) =>
                DateUtil.compareMonthKeys(a.monthYear, b.monthYear, 'asc'),
            );

            return {
                totalMonths: availableMonths.length,
                totalPurchases,
                totalAmount: Math.round(totalAmount * 100) / 100,
                averagePurchasesPerMonth: Math.round((totalPurchases / availableMonths.length) * 100) / 100,
                averageAmountPerMonth: Math.round((totalAmount / availableMonths.length) * 100) / 100,
                earliestMonth: sortedMonths.length > 0 ? sortedMonths[0].monthYear : null,
                latestMonth: sortedMonths.length > 0 ? sortedMonths[sortedMonths.length - 1].monthYear : null,
                highestSpendingMonth,
                mostActiveMonth,
            };
        } catch (error) {
            console.error(`Error in getAvailableMonthsSummary for family ${familyId}:`, error);
            throw error;
        }
    }

    async convertPurchaseToExpenses(purchaseId: string, userId: string, accountId?: string): Promise<any> {
        UuidUtil.validateUuid(purchaseId);
        UuidUtil.validateUuid(userId);

        // Find the purchase
        const purchase = (await this.purchaseModel
            .findOne({ _id: purchaseId, purchasedBy: userId })
            .exec()) as PurchaseDocument;
        if (!purchase) {
            throw new NotFoundException(`Purchase with ID "${purchaseId}" not found`);
        }

        if (!purchase.items || purchase.items.length === 0) {
            throw new NotFoundException(`Purchase has no items to convert`);
        }

        const createdExpenses = [];

        for (const item of purchase.items) {
            try {
                // Try to find a category that matches the product category
                let categoryId: string | null = null;
                try {
                    const categories = await this.categoriesService.findAll();
                    // Look for a category with a name that matches the item category
                    const matchingCategory = categories.find(
                        (cat) =>
                            cat.names.pt?.toLowerCase().includes(item.category.toLowerCase()) ||
                            cat.names.en?.toLowerCase().includes(item.category.toLowerCase()),
                    );
                    categoryId = matchingCategory?._id || null;
                } catch (error) {
                    // If category lookup fails, continue without category
                    console.warn(`Could not find category for ${item.category}:`, error);
                    continue;
                }

                const expenseData: CreateExpenseDto = {
                    categoryId: categoryId!,
                    amount: item.total,
                    date: purchase.date?.toISOString() ?? new Date().toISOString(),
                    paymentMethod: 'cash' as const, // Default payment method
                    description: `${item.name} (${item.quantity} ${item.unit})`,
                    accountId: accountId,
                };

                const expense = await this.expensesService.create(expenseData, userId);
                createdExpenses.push(expense);
            } catch (error) {
                console.error(`Failed to create expense for item ${item.name}:`, error);
                // Continue with other items even if one fails
            }
        }

        return {
            purchaseId,
            totalItems: purchase.items.length,
            convertedItems: createdExpenses.length,
            expenses: createdExpenses,
        };
    }

    async getAllPurchaseItemsByFamily(familyId: string): Promise<{
        [monthYear: string]: {
            [purchaseId: string]: {
                purchaseInfo: {
                    date: Date;
                    storeName?: string;
                    storeId: string;
                    totalAmount?: number;
                    purchasedBy: string;
                };
                items: Array<{
                    productId: string;
                    name: string;
                    description?: string;
                    barcode?: string;
                    brand?: string;
                    category: string;
                    subCategory?: string;
                    unit: string;
                    quantity: number;
                    price: number;
                    total: number;
                }>;
            };
        };
    }> {
        UuidUtil.validateUuid(familyId);

        const purchases = await this.purchaseModel
            .find({
                familyId,
                'items.0': { $exists: true }, // Only purchases with items
            })
            .sort({ date: -1 })
            .lean<LeanPurchase>()
            .exec();

        const result: {
            [monthYear: string]: {
                [purchaseId: string]: {
                    purchaseInfo: {
                        date: Date;
                        storeName?: string;
                        storeId: string;
                        totalAmount?: number;
                        purchasedBy: string;
                    };
                    items: Array<{
                        productId: string;
                        name: string;
                        description?: string;
                        barcode?: string;
                        brand?: string;
                        category: string;
                        subCategory?: string;
                        unit: string;
                        quantity: number;
                        price: number;
                        total: number;
                    }>;
                };
            };
        } = {};

        (purchases as unknown as Purchase[]).forEach((purchase: Purchase) => {
            if (!purchase.date || !purchase.items?.length) return;

            const monthYear = DateUtil.getMonthKeyForDate(purchase.date);
            const purchaseId = String(purchase._id);

            if (!result[monthYear]) {
                result[monthYear] = {};
            }

            result[monthYear][purchaseId] = {
                purchaseInfo: {
                    date: purchase.date,
                    storeName: purchase.storeName,
                    storeId: purchase.storeId,
                    totalAmount: purchase.totalAmount,
                    purchasedBy: purchase.purchasedBy,
                },
                items: purchase.items.map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    description: item.description,
                    barcode: item.barcode,
                    brand: item.brand,
                    category: item.category,
                    subCategory: item.subCategory,
                    unit: item.unit,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.total,
                })),
            };
        });

        return result;
    }
}
