import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PantryItem } from '../models/pantry-item';
import { mapCreatePantryItemDtoToPantryItem } from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';
import { PantryItemDocument } from './schemas/pantry-item.schema';

type LeanPantryItem = Omit<PantryItemDocument, 'save' | 'toObject' | 'id'> & { _id?: string };

@Injectable()
export class PantryItemsService {
    constructor(@InjectModel('PantryItem') private readonly pantryModel: Model<PantryItemDocument>) {}

    async create(familyId: string, createPantryItemDto: CreatePantryItemDto, userId: string) {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(userId);
        const doc = mapCreatePantryItemDtoToPantryItem(createPantryItemDto, familyId, userId);
        const created = await this.pantryModel.create(doc as unknown as PantryItemDocument);
        // created may be a Mongoose document ({ _id }) or a lower-level insert result ({ insertedId })
        const maybeCreated = created as unknown as { _id?: string; insertedId?: string };
        const createdId = maybeCreated.insertedId ?? maybeCreated._id;
        if (!createdId) throw new Error('Failed to determine created pantry item id');

        return (await this.pantryModel
            .findById(createdId)
            .lean<LeanPantryItem>()
            .exec()) as unknown as PantryItem | null;
    }

    async findAll(familyId: string): Promise<PantryItem[]> {
        UuidUtil.validateUuid(familyId);
        return (await this.pantryModel.find({ familyId }).lean<LeanPantryItem>().exec()) as unknown as PantryItem[];
    }

    async findOne(familyId: string, id: string): Promise<PantryItem> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(id);
        const doc = (await this.pantryModel
            .findOne({ familyId, _id: id })
            .lean<LeanPantryItem>()
            .exec()) as unknown as PantryItem | null;
        if (!doc)
            throw new NotFoundException(
                `Pantry item with ID "${String(id)}" not found in family "${String(familyId)}"`,
            );
        return doc;
    }

    async update(familyId: string, id: string, updatePantryItemDto: UpdatePantryItemDto, userId: string) {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(id);
        UuidUtil.validateUuid(userId);
        const doc = (await this.pantryModel
            .findOne({ familyId, _id: id })
            .lean<LeanPantryItem>()
            .exec()) as PantryItem | null;
        if (!doc)
            throw new NotFoundException(
                `Pantry item with ID "${String(id)}" not found in family "${String(familyId)}"`,
            );
        const updated = { ...doc, ...updatePantryItemDto, addedBy: userId, lastUpdatedAt: new Date() };
        await this.pantryModel.updateOne({ familyId, _id: id }, { $set: updated }).exec();
        return (await this.pantryModel
            .findOne({ familyId, _id: id })
            .lean<LeanPantryItem>()
            .exec()) as unknown as PantryItem | null;
    }

    async remove(familyId: string, id: string): Promise<PantryItem> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(id);
        const doc = (await this.pantryModel
            .findOne({ familyId, _id: id })
            .lean<LeanPantryItem>()
            .exec()) as unknown as PantryItem | null;
        if (!doc)
            throw new NotFoundException(
                `Pantry item with ID "${String(id)}" not found in family "${String(familyId)}"`,
            );
        await this.pantryModel.deleteOne({ familyId, _id: id }).exec();
        return doc;
    }
}
