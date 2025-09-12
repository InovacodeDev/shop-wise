import { ID } from '@/models/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Store } from '../models/store';
import { mapCreateStoreDtoToStore, mapUpdateStoreDtoToPartial } from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import type { StoreDocument } from './schemas/store.schema';

type LeanStore = Omit<StoreDocument, 'save' | 'toObject' | 'id'> & { _id?: any };

@Injectable()
export class StoresService {
    constructor(@InjectModel('Store') private storeModel: Model<StoreDocument>) {}

    async create(createStoreDto: CreateStoreDto): Promise<Store> {
        const doc = mapCreateStoreDtoToStore(createStoreDto);
        if (await this.storeModel.exists({ cnpj: doc.cnpj }).exec()) {
            return (await this.storeModel.findOne({ cnpj: doc.cnpj }).lean<LeanStore>().exec()) as unknown as Store;
        }
        const created = await this.storeModel.create(doc as unknown as StoreDocument);
        return (await this.storeModel.findById(created._id).lean<LeanStore>().exec()) as unknown as Store;
    }

    async findAll(): Promise<Store[]> {
        return (await this.storeModel.find({}).lean<LeanStore>().exec()) as unknown as Store[];
    }

    async findOne(_id: ID): Promise<Store> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.storeModel.findById(_id).lean<LeanStore>().exec()) as unknown as Store | null;
        if (!doc) throw new NotFoundException(`Store with ID "${String(_id)}" not found`);
        return doc;
    }

    async update(_id: ID, updateStoreDto: UpdateStoreDto): Promise<Store> {
        UuidUtil.validateUuid(_id);
        const existing = await this.storeModel.findById(_id).exec();
        if (!existing) throw new NotFoundException(`Store with ID "${String(_id)}" not found`);
        Object.assign(existing, mapUpdateStoreDtoToPartial(updateStoreDto));
        await existing.save();
        return (await this.storeModel.findById(_id).lean<LeanStore>().exec()) as unknown as Store;
    }

    async remove(_id: ID): Promise<Store> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.storeModel.findById(_id).lean<LeanStore>().exec()) as unknown as Store | null;
        if (!doc) throw new NotFoundException(`Store with ID "${String(_id)}" not found`);
        await this.storeModel.deleteOne({ _id }).exec();
        return doc;
    }
}
