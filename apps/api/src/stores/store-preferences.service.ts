import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { StorePreference } from '../models/store-preference';
import {
    mapCreateStorePreferenceDtoToStorePreference,
    mapUpdateStorePreferenceDtoToPartial,
} from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreateStorePreferenceDto, UpdateStorePreferenceDto } from './dto/store-preference.dto';
import { StorePreferenceDocument } from './schemas/store.schema';

type LeanStorePreference = Omit<StorePreferenceDocument, 'save' | 'toObject' | 'id'> & { _id?: any };

@Injectable()
export class StorePreferencesService {
    constructor(@InjectModel('StorePreference') private storePreferenceModel: Model<StorePreferenceDocument>) {}

    async createOrUpdate(
        familyId: string,
        createStorePreferenceDto: CreateStorePreferenceDto,
    ): Promise<StorePreference> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(createStorePreferenceDto.storeId);

        // Try to find existing preference
        const existing = await this.storePreferenceModel
            .findOne({ familyId, storeId: createStorePreferenceDto.storeId })
            .exec();

        if (existing) {
            // Update existing preference
            existing.preference = createStorePreferenceDto.preference;
            existing.updatedAt = new Date();
            await existing.save();
            return (await this.storePreferenceModel
                .findById(existing._id)
                .lean<LeanStorePreference>()
                .exec()) as unknown as StorePreference;
        } else {
            // Create new preference
            const doc = mapCreateStorePreferenceDtoToStorePreference(createStorePreferenceDto, familyId);
            const created = await this.storePreferenceModel.create(doc as unknown as StorePreferenceDocument);
            return (await this.storePreferenceModel
                .findById(created._id)
                .lean<LeanStorePreference>()
                .exec()) as unknown as StorePreference;
        }
    }

    async findAllByFamily(familyId: string): Promise<StorePreference[]> {
        UuidUtil.validateUuid(familyId);
        return (await this.storePreferenceModel
            .find({ familyId })
            .lean<LeanStorePreference>()
            .exec()) as unknown as StorePreference[];
    }

    async findOne(familyId: string, storeId: string): Promise<StorePreference | null> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(storeId);
        return (await this.storePreferenceModel
            .findOne({ familyId, storeId })
            .lean<LeanStorePreference>()
            .exec()) as unknown as StorePreference | null;
    }

    async updatePurchaseStats(familyId: string, storeId: string, purchaseDate: Date): Promise<void> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(storeId);

        // Try to find existing preference
        const existing = await this.storePreferenceModel.findOne({ familyId, storeId }).exec();

        if (existing) {
            // Update stats
            existing.purchaseCount += 1;
            existing.lastPurchaseDate = purchaseDate;
            existing.updatedAt = new Date();
            await existing.save();
        } else {
            // Create new preference as favorite (auto-favorite on first purchase)
            const doc = mapCreateStorePreferenceDtoToStorePreference({ storeId, preference: 'favorite' }, familyId);
            doc.purchaseCount = 1;
            doc.lastPurchaseDate = purchaseDate;
            await this.storePreferenceModel.create(doc as unknown as StorePreferenceDocument);
        }
    }

    async update(
        familyId: string,
        storeId: string,
        updateStorePreferenceDto: UpdateStorePreferenceDto,
    ): Promise<StorePreference> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(storeId);

        const existing = await this.storePreferenceModel.findOne({ familyId, storeId }).exec();
        if (!existing) {
            throw new NotFoundException(`Store preference not found for family "${familyId}" and store "${storeId}"`);
        }

        const updates = mapUpdateStorePreferenceDtoToPartial(updateStorePreferenceDto);
        Object.assign(existing, updates);
        await existing.save();

        return (await this.storePreferenceModel
            .findById(existing._id)
            .lean<LeanStorePreference>()
            .exec()) as unknown as StorePreference;
    }

    async remove(familyId: string, storeId: string): Promise<StorePreference> {
        UuidUtil.validateUuid(familyId);
        UuidUtil.validateUuid(storeId);

        const doc = (await this.storePreferenceModel
            .findOne({ familyId, storeId })
            .lean<LeanStorePreference>()
            .exec()) as unknown as StorePreference | null;

        if (!doc) {
            throw new NotFoundException(`Store preference not found for family "${familyId}" and store "${storeId}"`);
        }

        await this.storePreferenceModel.deleteOne({ familyId, storeId }).exec();
        return doc;
    }

    async getFavoriteStores(familyId: string): Promise<StorePreference[]> {
        UuidUtil.validateUuid(familyId);
        return (await this.storePreferenceModel
            .find({ familyId, preference: 'favorite' })
            .sort({ purchaseCount: -1, lastPurchaseDate: -1 })
            .lean<LeanStorePreference>()
            .exec()) as unknown as StorePreference[];
    }

    async getIgnoredStores(familyId: string): Promise<StorePreference[]> {
        UuidUtil.validateUuid(familyId);
        return (await this.storePreferenceModel
            .find({ familyId, preference: 'ignored' })
            .lean<LeanStorePreference>()
            .exec()) as unknown as StorePreference[];
    }
}
