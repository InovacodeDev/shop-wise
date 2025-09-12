import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ID } from '../models/common';
import { Product } from '../models/product';
import { mapCreateProductDtoToProduct, mapUpdateProductDtoToPartial } from '../utils/dto-mappers';
import { UuidUtil } from '../utils/uuid.util';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductDocument } from './schemas/product.schema';

type LeanProduct = Omit<ProductDocument, 'save' | 'toObject' | 'id'> & { _id?: any };

@Injectable()
export class ProductsService {
    constructor(@InjectModel('Product') private readonly productModel: Model<ProductDocument>) {}

    async create(createProductDto: CreateProductDto): Promise<Product | null> {
        const doc = mapCreateProductDtoToProduct(createProductDto);
        const created = await this.productModel.create(doc as unknown as ProductDocument);
        return (await this.productModel.findById(created._id).lean<LeanProduct>().exec()) as unknown as Product | null;
    }

    async findAll(): Promise<Product[]> {
        return (await this.productModel.find({}).lean<LeanProduct>().exec()) as unknown as Product[];
    }

    async findOne(_id: ID): Promise<Product> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.productModel.findById(_id).lean<LeanProduct>().exec()) as unknown as Product | null;
        if (!doc) throw new NotFoundException(`Product with ID "${String(_id)}" not found`);
        return doc;
    }

    async update(_id: ID, updateProductDto: UpdateProductDto): Promise<Product | null> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.productModel.findById(_id).lean<LeanProduct>().exec()) as unknown as Product | null;
        if (!doc) throw new NotFoundException(`Product with ID "${String(_id)}" not found`);
        const updated = { ...doc, ...mapUpdateProductDtoToPartial(updateProductDto) };
        await this.productModel.updateOne({ _id }, { $set: updated }).exec();
        return (await this.productModel.findById(_id).lean<LeanProduct>().exec()) as Product | null;
    }

    async remove(_id: ID): Promise<Product> {
        UuidUtil.validateUuid(_id);
        const doc = (await this.productModel.findById(_id).lean<LeanProduct>().exec()) as unknown as Product | null;
        if (!doc) throw new NotFoundException(`Product with ID "${String(_id)}" not found`);
        await this.productModel.deleteOne({ _id }).exec();
        return doc;
    }
}
