import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    productName: string;

    @IsString()
    @IsNotEmpty()
    normalizedName: string;

    @IsString()
    @IsOptional()
    brand?: string;

    @IsString()
    @IsOptional()
    barcode?: string;

    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsString()
    @IsOptional()
    size?: string;

    @IsUrl()
    @IsOptional()
    imageUrl?: string;
}
