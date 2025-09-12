import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    productName?: string;

    @IsString()
    @IsOptional()
    normalizedName?: string;

    @IsString()
    @IsOptional()
    brand?: string;

    @IsString()
    @IsOptional()
    barcode?: string;

    @IsString()
    @IsOptional()
    categoryId?: string;

    @IsString()
    @IsOptional()
    size?: string;

    @IsUrl()
    @IsOptional()
    imageUrl?: string;
}
