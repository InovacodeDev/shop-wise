import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

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

    @IsNumber()
    @IsOptional()
    discount?: number;

    @IsString()
    @IsOptional()
    @IsIn(['iFood', '99', 'store', 'marketplace', 'online_store'])
    purchaseType?: 'iFood' | '99' | 'store' | 'marketplace' | 'online_store';
}
