import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class RawNfceProductDto {
    @IsString()
    @IsNotEmpty()
    barcode: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    quantity: number;

    @IsString()
    @IsNotEmpty()
    volume: string;

    @IsNumber()
    unitPrice: number;

    @IsNumber()
    price: number;

    @IsString()
    @IsOptional()
    brand?: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsOptional()
    subcategory?: string;
}

class RawNfceDataDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RawNfceProductDto)
    products: RawNfceProductDto[];

    @IsString()
    @IsNotEmpty()
    storeName: string;

    @IsString()
    @IsNotEmpty()
    date: string;

    @IsString()
    @IsNotEmpty()
    cnpj: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    accessKey: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    nfceNumber: string;

    @IsString()
    @IsNotEmpty()
    series: string;

    @IsString()
    @IsNotEmpty()
    emissionDateTime: string;

    @IsString()
    @IsNotEmpty()
    authorizationProtocol: string;

    @IsNumber()
    totalAmount: number;

    @IsString()
    @IsOptional()
    paymentMethod?: string;

    @IsNumber()
    @IsOptional()
    amountPaid?: number;
}

export class ExtractDataFromNfceWebDto {
    @ValidateNested()
    @Type(() => RawNfceDataDto)
    @IsNotEmpty()
    rawNfceData: RawNfceDataDto;
}
