import { ID } from '@/models/common';
import { Product } from '@/models/product';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import { Purchase, PurchaseItem } from '../models/purchase';
import { PurchaseDocument } from '../purchases/schemas/purchase.schema';
import { CreatePurchaseItemDto } from './dto/create-purchase-item.dto';
import { UpdatePurchaseItemDto } from './dto/update-purchase-item.dto';

@Injectable()
export class PurchaseItemsService {
    constructor(
        @InjectModel('Purchase') private readonly purchaseModel: Model<PurchaseDocument>,
        @InjectModel('Product') private readonly productModel: Model<Product>,
    ) {}

    // Helper: fetch the last N purchases for a product within the family
    private async fetchLastPurchasesForProduct(familyId: string, productId: string, limit = 12) {
        // Find purchases in the same family that have items with this productId
        const docs = await this.purchaseModel
            .find({ familyId, 'items.productId': productId })
            .sort({ date: -1 })
            .limit(limit)
            .select('date items _id storeId storeName')
            .lean()
            .exec();

        const results: Array<{
            date?: Date;
            price?: number;
            quantity?: number;
            storeId?: string;
            storeName?: string;
            purchaseId?: string;
        }> = [];
        for (const d of docs) {
            const it = (d.items || []).find(
                (i: PurchaseItem & { productId?: string }) => String(i.productId) === String(productId),
            );
            if (!it) continue;
            results.push({
                date: d.date as Date,
                price: it.price,
                quantity: it.quantity,
                storeId: d.storeId,
                storeName: d.storeName,
                purchaseId: d._id,
            });
        }

        return results.slice(0, limit);
    }

    // Helper: update a specific item inside a purchase document with lastPurchases
    private async updateItemLastPurchases(familyId: string, purchaseId: string, item: PurchaseItem & { _id?: string }) {
        if (!item || !item.productId) return;
        try {
            const last = await this.fetchLastPurchasesForProduct(familyId, item.productId, 12);
            // Update only the matching item inside the purchase document
            await this.purchaseModel
                .updateOne(
                    { familyId, _id: purchaseId, 'items.productId': item.productId },
                    { $set: { 'items.$.lastPurchases': last } },
                )
                .exec();
        } catch (err) {
            // swallow errors in background task
            console.warn('Failed to populate lastPurchases for item', err);
        }
    }

    private async getPurchase(familyId: string, purchaseId: string) {
        type LeanPurchase = Omit<PurchaseDocument, 'save' | 'toObject' | 'id'> & { _id?: string };
        const purchase = (await this.purchaseModel
            .findOne({ familyId, _id: purchaseId })
            .lean<LeanPurchase>()
            .exec()) as Purchase | null;
        if (!purchase) throw new NotFoundException('Purchase not found');
        return { purchase, fId: familyId, pId: purchaseId };
    }

    async create(familyId: string, purchaseId: string, dto: CreatePurchaseItemDto): Promise<PurchaseItem> {
        const { fId, pId } = await this.getPurchase(familyId, purchaseId);

        const item: PurchaseItem = {
            productId: dto.productId,
            name: dto.name || '',
            description: dto.description,
            barcode: dto.barcode,
            brand: dto.brand,
            category: dto.category || '',
            subCategory: dto.subCategory,
            unit: dto.unit || 'un',
            quantity: dto.quantity,
            price: dto.price ?? 0,
            total: (dto.price ?? 0) * dto.quantity,
        };

        await this.purchaseModel.updateOne({ familyId: fId, _id: pId }, { $push: { items: item } }).exec();
        // populate lastPurchases asynchronously (do not block response)
        void this.updateItemLastPurchases(fId, pId, item);
        return item;
    }

    async findAll(familyId: string, purchaseId: string): Promise<PurchaseItem[]> {
        const { purchase } = await this.getPurchase(familyId, purchaseId);
        return purchase.items || [];
    }

    async findOne(familyId: string, purchaseId: string, itemId: string): Promise<PurchaseItem> {
        const items = await this.findAll(familyId, purchaseId);
        const found = (items || []).find((it: PurchaseItem & { _id?: string }) => String(it._id) === String(itemId));
        if (!found) throw new NotFoundException('Item not found');
        return found;
    }

    async update(
        familyId: string,
        purchaseId: string,
        itemId: string,
        dto: UpdatePurchaseItemDto,
    ): Promise<PurchaseItem> {
        const { purchase, fId, pId } = await this.getPurchase(familyId, purchaseId);

        const items = (purchase.items || []) as Array<PurchaseItem & { _id?: string }>;
        const idx = items.findIndex((it) => String((it as PurchaseItem & { _id?: string })._id) === String(itemId));
        if (idx === -1) throw new NotFoundException('Item not found');
        const updated: PurchaseItem & { _id?: ID } = { ...items[idx], ...dto } as PurchaseItem & {
            _id?: string;
        };
        updated.total = (updated.price ?? 0) * (updated.quantity ?? 0);
        items[idx] = updated;
        await this.purchaseModel.updateOne({ familyId: fId, _id: pId }, { $set: { items } }).exec();
        // background update of lastPurchases for this updated item
        void this.updateItemLastPurchases(fId, pId, updated as PurchaseItem & { _id?: string });
        return updated as PurchaseItem;
    }

    async remove(familyId: string, purchaseId: string, itemId: string) {
        const { fId, pId } = await this.getPurchase(familyId, purchaseId);

        await this.purchaseModel.updateOne({ familyId: fId, _id: pId }, { $pull: { items: { _id: itemId } } }).exec();
        return { removed: String(itemId) };
    }

    async bulkUpdate(familyId: string, purchaseId: string, items: Array<PurchaseItem>) {
        const { purchase, fId, pId } = await this.getPurchase(familyId, purchaseId);

        const existing = purchase.items || [];
        const merged = [...existing];
        const newProducts: Array<Product> = [];

        for (const it of items) {
            if (it.barcode) {
                const idx = merged.findIndex((m: PurchaseItem) => m.barcode === it.barcode);
                if (idx !== -1) {
                    merged[idx] = { ...merged[idx], ...it };
                    merged[idx].total = (merged[idx].price ?? 0) * (merged[idx].quantity ?? 0);
                    continue;
                } else {
                    const uuid = randomUUID();
                    const now = new Date();
                    newProducts.push({
                        _id: uuid,
                        name: it.name,
                        description: it.description,
                        barcode: it.barcode,
                        brand: it.brand,
                        category: it.category,
                        subCategory: it.subCategory,
                        unit: it.unit || 'un',
                        createdAt: now,
                        updatedAt: now,
                    });
                    // add new
                    merged.push({
                        productId: uuid,
                        name: it.name,
                        description: it.description,
                        barcode: it.barcode,
                        brand: it.brand,
                        category: it.category,
                        subCategory: it.subCategory,
                        unit: it.unit || 'un',
                        quantity: it.quantity,
                        price: it.price ?? 0,
                        total: it.total ?? 0,
                    });
                }
            }
        }

        try {
            for (const p of newProducts) {
                if (await this.productModel.exists({ barcode: p.barcode }).exec()) continue;
                await this.productModel.create(p);
            }
        } catch (error) {
            console.log(error);
        }
        await this.purchaseModel.updateOne({ familyId: fId, _id: pId }, { $set: { items: merged } }).exec();

        // populate lastPurchases asynchronously for merged items (best-effort)
        for (const mi of merged) {
            void this.updateItemLastPurchases(fId, pId, mi as PurchaseItem & { _id?: string });
        }

        return merged;
    }

    async bulkRemove(familyId: string, purchaseId: string, itemIds: string[]) {
        const { fId, pId } = await this.getPurchase(familyId, purchaseId);

        await this.purchaseModel
            .updateOne({ familyId: fId, _id: pId }, { $pull: { items: { _id: { $in: itemIds } } } })
            .exec();
        return { removed: itemIds.map(String) };
    }
}
