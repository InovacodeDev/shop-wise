import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AiService } from '../ai/ai.service';
import { ShoppingListItem as ShoppingListItemType } from '../ai/flows/generate-shopping-list';
import { ShoppingList } from '../models/shopping-list';
import { PurchaseDocument } from '../purchases/schemas/purchase.schema';
import { StorePreferencesService } from '../stores/store-preferences.service';
import { mapCreateShoppingListDtoToShoppingList, mapUpdateShoppingListDtoToPartial } from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreateAiShoppingListDto } from './dto/create-ai-shopping-list.dto';
import { CreateShoppingListDto, ShoppingListStatus } from './dto/create-shopping-list.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { ShoppingListDocument } from './schemas/shopping-list.schema';

type LeanShoppingList = Omit<ShoppingListDocument, 'save' | 'toObject' | 'id'> & { _id?: string };
type LeanPurchase = Omit<PurchaseDocument, 'save' | 'toObject' | 'id'> & { _id?: string };

@Injectable()
export class ShoppingListsService {
    constructor(
        @InjectModel('ShoppingList') private readonly shoppingListModel: Model<ShoppingListDocument>,
        @InjectModel('Purchase') private readonly purchaseModel: Model<PurchaseDocument>,
        private readonly aiService: AiService,
        private readonly storePreferencesService: StorePreferencesService,
    ) {}

    async create(
        familyId: string,
        createShoppingListDto: CreateShoppingListDto,
        userId: string,
    ): Promise<ShoppingList> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(userId);
        const doc = mapCreateShoppingListDtoToShoppingList(createShoppingListDto, familyId, userId);
        const created = await this.shoppingListModel.create(doc as unknown as ShoppingListDocument);
        return (await this.shoppingListModel
            .findById(created._id)
            .lean<LeanShoppingList>()
            .exec()) as unknown as ShoppingList;
    }

    async findAll(familyId: string): Promise<ShoppingList[]> {
        UuidUtil.validateUuid(familyId);
        const result = (await this.shoppingListModel
            .find({ familyId })
            .lean<LeanShoppingList>()
            .exec()) as unknown as ShoppingList[];

        // Ensure all lists have a status field for backward compatibility
        const resultWithStatus = result.map((list) => ({
            ...list,
            status: list.status || 'active',
        }));

        return resultWithStatus;
    }

    async findOne(familyId: string, id: string): Promise<ShoppingList> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(id);
        const doc = (await this.shoppingListModel
            .findOne({ familyId, _id: id })
            .lean<LeanShoppingList>()
            .exec()) as unknown as ShoppingList | null;
        if (!doc)
            throw new NotFoundException(
                `Shopping list with ID "${String(id)}" not found in family "${String(familyId)}"`,
            );
        return doc;
    }

    async update(familyId: string, id: string, updateShoppingListDto: UpdateShoppingListDto): Promise<ShoppingList> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(id);
        const doc = (await this.shoppingListModel
            .findOne({ familyId, _id: id })
            .lean<LeanShoppingList>()
            .exec()) as ShoppingList | null;
        if (!doc)
            throw new NotFoundException(
                `Shopping list with ID "${String(id)}" not found in family "${String(familyId)}"`,
            );
        const updated = { ...doc, ...mapUpdateShoppingListDtoToPartial(updateShoppingListDto) };
        await this.shoppingListModel.updateOne({ familyId, _id: id }, { $set: updated }).exec();
        return (await this.shoppingListModel
            .findOne({ familyId, _id: id })
            .lean<LeanShoppingList>()
            .exec()) as unknown as ShoppingList;
    }

    async remove(familyId: string, id: string): Promise<ShoppingList> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(id);
        const doc = (await this.shoppingListModel
            .findOne({ familyId, _id: id })
            .lean<LeanShoppingList>()
            .exec()) as unknown as ShoppingList | null;
        if (!doc)
            throw new NotFoundException(
                `Shopping list with ID "${String(id)}" not found in family "${String(familyId)}"`,
            );
        await this.shoppingListModel.deleteOne({ familyId, _id: id }).exec();
        return doc;
    }

    async createWithAi(
        familyId: string,
        createAiShoppingListDto: CreateAiShoppingListDto,
        userId: string,
    ): Promise<ShoppingList> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(userId);

        // Get current date info for period analysis
        const now = new Date();
        const currentDay = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        // Determine current period of the month
        let currentPeriod = 'beginning';
        if (currentDay > daysInMonth * 0.33 && currentDay <= daysInMonth * 0.66) {
            currentPeriod = 'middle';
        } else if (currentDay > daysInMonth * 0.66) {
            currentPeriod = 'end';
        }

        // Get purchase history for the family (extended for better period analysis)
        const purchases = (await this.purchaseModel
            .find({ familyId })
            .populate('items')
            .sort({ date: -1 })
            .limit(150) // More history for period analysis
            .lean<LeanPurchase>()
            .exec()) as unknown as LeanPurchase[];

        // Analyze historical patterns for similar periods
        const periodAnalysis = this.analyzePurchasePatterns(purchases, currentPeriod);

        // Get favorite stores
        const favoriteStores = await this.storePreferencesService.getFavoriteStores(familyId);
        const favoriteStoreNames = favoriteStores
            .map((pref) => purchases.find((p) => p.storeId === pref.storeId)?.storeName || '')
            .filter((name) => name);

        // Format purchase history for AI analysis with period context
        const purchaseHistory = purchases
            .map((purchase) => {
                const purchaseDate = purchase.date ? new Date(purchase.date) : null;
                const purchasePeriod = purchaseDate ? this.getPeriodOfMonth(purchaseDate) : 'unknown';
                const items = purchase.items
                    ?.map((item) => `${item.name || 'Unknown'} (${item.quantity || 0}x, $${item.price || 0})`)
                    ?.join(', ');
                return `Date: ${purchase.date?.toISOString() ?? 'N/A'}, Period: ${purchasePeriod}, Store: ${purchase.storeName || 'N/A'}, Items: ${items || 'N/A'}`;
            })
            .join('\n');

        // Generate shopping list using AI with enhanced context
        const aiResult = await this.aiService.generateShoppingList({
            purchaseHistory: purchaseHistory || 'No purchase history available',
            familySize: createAiShoppingListDto.familySize,
            preferences: createAiShoppingListDto.preferences,
            listName: createAiShoppingListDto.listName,
            currentPeriod: currentPeriod,
            periodAnalysis: periodAnalysis,
            favoriteStores: favoriteStoreNames,
        });

        // Convert AI items to shopping list items
        const shoppingListItems = aiResult.items.map((item: ShoppingListItemType) => ({
            id: UuidUtil.generateUuid(),
            name: item.name,
            quantity: item.quantity,
            purchased: false,
        }));

        // Create the shopping list DTO
        const createDto: CreateShoppingListDto = {
            name: aiResult.listName,
            status: ShoppingListStatus.ACTIVE,
        };

        // Create the shopping list document
        const doc = mapCreateShoppingListDtoToShoppingList(createDto, familyId, userId);
        doc.items = shoppingListItems;

        const created = await this.shoppingListModel.create(doc as unknown as ShoppingListDocument);
        return (await this.shoppingListModel
            .findById(created._id)
            .lean<LeanShoppingList>()
            .exec()) as unknown as ShoppingList;
    }

    private getPeriodOfMonth(date: Date): string {
        const day = date.getDate();
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

        if (day <= daysInMonth * 0.33) return 'beginning';
        if (day <= daysInMonth * 0.66) return 'middle';
        return 'end';
    }

    private analyzePurchasePatterns(purchases: LeanPurchase[], currentPeriod: string): string {
        const patterns = {
            beginning: [] as LeanPurchase[],
            middle: [] as LeanPurchase[],
            end: [] as LeanPurchase[],
        };

        // Categorize purchases by period
        purchases.forEach((purchase) => {
            if (!purchase.date) return;
            const period = this.getPeriodOfMonth(new Date(purchase.date));
            if (patterns[period as keyof typeof patterns]) {
                patterns[period as keyof typeof patterns].push(purchase);
            }
        });

        const currentPeriodPurchases = patterns[currentPeriod as keyof typeof patterns];

        if (currentPeriodPurchases.length === 0) {
            return `No historical data for ${currentPeriod} of month. Consider general monthly patterns.`;
        }

        // Analyze frequency and patterns
        const itemFrequency = new Map<string, { count: number; avgQuantity: number; stores: Set<string> }>();

        currentPeriodPurchases.forEach((purchase) => {
            purchase.items?.forEach((item) => {
                const key = item.name || 'Unknown';
                if (!itemFrequency.has(key)) {
                    itemFrequency.set(key, { count: 0, avgQuantity: 0, stores: new Set() });
                }
                const freq = itemFrequency.get(key)!;
                freq.count += 1;
                freq.avgQuantity += item.quantity || 0;
                if (purchase.storeName) freq.stores.add(purchase.storeName);
            });
        });

        // Calculate averages and create analysis
        const frequentItems = Array.from(itemFrequency.entries())
            .filter(([, data]) => data.count >= 2) // Items bought at least twice in this period
            .map(([name, data]) => ({
                name,
                frequency: data.count,
                avgQuantity: data.avgQuantity / data.count,
                stores: Array.from(data.stores),
            }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 10); // Top 10 most frequent items

        if (frequentItems.length === 0) {
            return `Limited patterns for ${currentPeriod} of month. Focus on essential household items.`;
        }

        const analysisText =
            `${currentPeriod.toUpperCase()} OF MONTH PATTERNS:\n` +
            frequentItems
                .map(
                    (item) =>
                        `- ${item.name}: bought ${item.frequency} times, avg ${item.avgQuantity.toFixed(1)} units, common stores: ${item.stores.slice(0, 2).join(', ')}`,
                )
                .join('\n') +
            `\n\nBased on ${currentPeriodPurchases.length} historical purchases during ${currentPeriod} of month.`;

        return analysisText;
    }
}
