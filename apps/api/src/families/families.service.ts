import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Family } from '../models/family';
import { mapCreateFamilyDtoToFamily, mapUpdateFamilyDtoToPartial } from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import type { FamilyDocument } from './schemas/family.schema';

type LeanFamily = Omit<FamilyDocument, 'save' | 'toObject' | 'id'> & { _id?: string };

@Injectable()
export class FamiliesService {
    constructor(@InjectModel('Family') private familyModel: Model<FamilyDocument>) {}

    async create(createFamilyDto: CreateFamilyDto, ownerId: string): Promise<Family> {
        const doc = mapCreateFamilyDtoToFamily(createFamilyDto, ownerId);
        const created = await this.familyModel.create(doc as unknown as FamilyDocument);
        return (await this.familyModel.findById(created._id).lean<LeanFamily>().exec()) as unknown as Family;
    }

    async findAll(): Promise<Family[]> {
        return (await this.familyModel.find({}).lean<LeanFamily>().exec()) as unknown as Family[];
    }

    async findOne(id: string): Promise<Family> {
        UuidUtil.validateUuid(id);
        const doc = (await this.familyModel.findById(id).lean<LeanFamily>().exec()) as unknown as Family | null;
        if (!doc) throw new NotFoundException(`Family with ID "${String(id)}" not found`);
        return doc;
    }
    async update(id: string, updateFamilyDto: UpdateFamilyDto): Promise<Family> {
        UuidUtil.validateUuid(id);

        // Check if family exists first
        const existing = await this.familyModel.findById(id).lean<LeanFamily>().exec();
        if (!existing) throw new NotFoundException(`Family with ID "${String(id)}" not found`);

        // Use updateOne to only send modified fields
        const updateData = mapUpdateFamilyDtoToPartial(updateFamilyDto);
        await this.familyModel.updateOne({ _id: id }, { $set: updateData }).exec();

        return (await this.familyModel.findById(id).lean<LeanFamily>().exec()) as unknown as Family;
    }

    async remove(id: string): Promise<Family> {
        UuidUtil.validateUuid(id);
        const doc = (await this.familyModel.findById(id).lean<LeanFamily>().exec()) as unknown as Family | null;
        if (!doc) throw new NotFoundException(`Family with ID "${String(id)}" not found`);
        await this.familyModel.deleteOne({ _id: id }).exec();
        return doc;
    }
}
