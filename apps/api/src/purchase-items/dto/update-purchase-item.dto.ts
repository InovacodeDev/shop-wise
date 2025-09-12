import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

import type { ProductUnit } from '../../models/product';

export class UpdatePurchaseItemDto {
    @IsString()
    @IsOptional()
    productId?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    barcode?: string;

    @IsString()
    @IsOptional()
    brand?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    subCategory?: string;

    @IsString()
    @IsOptional()
    @IsIn(['kg', 'l', 'un'])
    unit?: ProductUnit;

    @IsNumber()
    @IsOptional()
    quantity?: number;

    @IsNumber()
    @IsOptional()
    price?: number;
}
