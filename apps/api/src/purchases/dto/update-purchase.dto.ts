import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePurchaseDto {
    @IsString()
    @IsOptional()
    storeId?: string;

    @IsString()
    @IsOptional()
    storeName?: string;

    @IsDateString()
    @IsOptional()
    date?: string;

    @IsNumber()
    @IsOptional()
    totalAmount?: number;
}
