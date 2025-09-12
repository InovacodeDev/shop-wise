import { ID } from '@/models/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Category } from '../models/category';
import { mapCreateCategoryDtoToCategory, mapUpdateCategoryDtoToPartial } from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import type { CategoryDocument } from './schemas/category.schema';

type LeanCategory = Omit<CategoryDocument, 'save' | 'toObject' | 'id'> & { _id?: any };

@Injectable()
export class CategoriesService {
    constructor(@InjectModel('Category') private categoryModel: Model<CategoryDocument>) {}

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const doc = mapCreateCategoryDtoToCategory(createCategoryDto);
        const created = await this.categoryModel.create(doc as unknown as CategoryDocument);
        return (await this.categoryModel.findById(created._id).lean<LeanCategory>().exec()) as unknown as Category;
    }

    async findAll(): Promise<Category[]> {
        return (await this.categoryModel.find({}).lean<LeanCategory>().exec()) as unknown as Category[];
    }

    async findOne(_id: ID): Promise<Category> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.categoryModel.findById(_id).lean<LeanCategory>().exec()) as unknown as Category | null;
        if (!doc) throw new NotFoundException(`Category with ID "${String(_id)}" not found`);
        return doc;
    }

    async update(_id: ID, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        UuidUtil.validateUuid(_id);
        const existing = await this.categoryModel.findById(_id).exec();
        if (!existing) throw new NotFoundException(`Category with ID "${String(_id)}" not found`);
        Object.assign(existing, mapUpdateCategoryDtoToPartial(updateCategoryDto));
        await existing.save();
        return (await this.categoryModel.findById(_id).lean<LeanCategory>().exec()) as unknown as Category;
    }

    async remove(_id: ID): Promise<Category> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.categoryModel.findById(_id).lean<LeanCategory>().exec()) as unknown as Category | null;
        if (!doc) throw new NotFoundException(`Category with ID "${String(_id)}" not found`);
        await this.categoryModel.deleteOne({ _id }).exec();
        return doc;
    }
}
