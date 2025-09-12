import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

// Enhanced product data structure
export class EnhancedNfceProductDto {
    @IsString()
    @IsNotEmpty()
    barcode: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    price: number;

    @IsNumber()
    unitPrice: number;

    @IsString()
    @IsNotEmpty()
    volume: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    subcategory?: string;

    @IsString()
    @IsOptional()
    brand?: string;
}

// Purchase data structure within enhanced data
export class EnhancedPurchaseDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EnhancedNfceProductDto)
    products: EnhancedNfceProductDto[];

    @IsString()
    @IsOptional()
    storeId?: string;

    @IsString()
    @IsNotEmpty()
    storeName: string;

    @IsString()
    @IsNotEmpty()
    date: string;

    @IsNumber()
    totalAmount: number;

    @IsString()
    @IsOptional()
    familyId?: string;
}

// Store data structure within enhanced data
export class EnhancedStoreDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    cnpj: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    type: string;
}

// Category data structure within enhanced data
export class EnhancedCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    familyId?: string;
}

// Family data structure within enhanced data
export class EnhancedFamilyDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}

// Main enhanced data structure
export class EnhancedNfceDataDto {
    @ValidateNested()
    @Type(() => EnhancedPurchaseDto)
    purchase: EnhancedPurchaseDto;

    @ValidateNested()
    @Type(() => EnhancedStoreDto)
    @IsOptional()
    store?: EnhancedStoreDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EnhancedCategoryDto)
    @IsOptional()
    categories?: EnhancedCategoryDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EnhancedFamilyDto)
    @IsOptional()
    families?: EnhancedFamilyDto[];
}

// Main enhanced response structure
export class EnhancedNfceResponseDto {
    @IsBoolean()
    success: boolean;

    @ValidateNested()
    @Type(() => EnhancedNfceDataDto)
    @IsOptional()
    data?: EnhancedNfceDataDto;

    @IsString()
    @IsOptional()
    error?: string;
}
