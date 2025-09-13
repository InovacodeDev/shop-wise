import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ShoppingList } from '../models/shopping-list';
import { UuidUtil } from '../utils/uuid.util';
import { CreateShoppingListItemDto } from './dto/create-shopping-list-item.dto';
import { UpdateShoppingListItemDto } from './dto/update-shopping-list-item.dto';
import { ShoppingListDocument } from './schemas/shopping-list.schema';

export interface ShoppingListItemResponse {
    id: string;
    name: string;
    quantity: number;
    purchased: boolean;
    // Extended properties for frontend compatibility
    unit?: string;
    isCompleted?: boolean;
    checked?: boolean;
    notes?: string;
    estimatedPrice?: number;
}

type LeanShoppingList = Omit<ShoppingListDocument, 'save' | 'toObject' | 'id'> & { _id?: string };

@Injectable()
export class ShoppingListItemsService {
    constructor(@InjectModel('ShoppingList') private readonly shoppingListModel: Model<ShoppingListDocument>) {}

    async create(
        familyId: string,
        listId: string,
        createDto: CreateShoppingListItemDto,
    ): Promise<ShoppingListItemResponse> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(listId);

        const list = await this.findShoppingList(familyId, listId);

        const newItem = {
            id: UuidUtil.generateUuid(),
            name: createDto.name,
            quantity: createDto.quantity,
            purchased: createDto.isCompleted || createDto.checked || false,
        };

        if (!list.items) {
            list.items = [];
        }
        list.items.push(newItem);

        await this.shoppingListModel.updateOne({ familyId, _id: listId }, { $set: { items: list.items } });

        return {
            ...newItem,
            unit: createDto.unit,
            isCompleted: newItem.purchased,
            checked: newItem.purchased,
            notes: createDto.notes,
            estimatedPrice: createDto.estimatedPrice,
        };
    }

    async findAll(familyId: string, listId: string): Promise<ShoppingListItemResponse[]> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(listId);

        const list = await this.findShoppingList(familyId, listId);
        return (list.items || []).map((item) => ({
            ...item,
            isCompleted: item.purchased,
            checked: item.purchased,
        }));
    }

    async findOne(familyId: string, listId: string, itemId: string): Promise<ShoppingListItemResponse> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(listId);

        const list = await this.findShoppingList(familyId, listId);
        const item = list.items?.find((item) => item.id === itemId);

        if (!item) {
            throw new NotFoundException(`Item with ID "${itemId}" not found in shopping list "${listId}"`);
        }

        return {
            ...item,
            isCompleted: item.purchased,
            checked: item.purchased,
        };
    }

    async update(
        familyId: string,
        listId: string,
        itemId: string,
        updateDto: UpdateShoppingListItemDto,
    ): Promise<ShoppingListItemResponse> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(listId);

        const list = await this.findShoppingList(familyId, listId);
        const itemIndex = list.items?.findIndex((item) => item.id === itemId);

        if (itemIndex === undefined || itemIndex === -1) {
            throw new NotFoundException(`Item with ID "${itemId}" not found in shopping list "${listId}"`);
        }

        const existingItem = list.items![itemIndex];
        const updatedItem = {
            ...existingItem,
            ...updateDto,
        };

        list.items![itemIndex] = updatedItem;

        await this.shoppingListModel.updateOne({ familyId, _id: listId }, { $set: { items: list.items } });

        return updatedItem;
    }

    async remove(familyId: string, listId: string, itemId: string): Promise<ShoppingListItemResponse> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(listId);

        const list = await this.findShoppingList(familyId, listId);
        const itemIndex = list.items?.findIndex((item) => item.id === itemId);

        if (itemIndex === undefined || itemIndex === -1) {
            throw new NotFoundException(`Item with ID "${itemId}" not found in shopping list "${listId}"`);
        }

        const removedItem = list.items![itemIndex];
        list.items!.splice(itemIndex, 1);

        await this.shoppingListModel.updateOne({ familyId, _id: listId }, { $set: { items: list.items } });

        return removedItem;
    }

    private async findShoppingList(familyId: string, listId: string): Promise<ShoppingList> {
        const doc = (await this.shoppingListModel
            .findOne({ familyId, _id: listId })
            .lean<LeanShoppingList>()
            .exec()) as unknown as ShoppingList | null;

        if (!doc) {
            throw new NotFoundException(`Shopping list with ID "${listId}" not found in family "${familyId}"`);
        }

        return doc;
    }
}
