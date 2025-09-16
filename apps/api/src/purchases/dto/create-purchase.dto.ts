import { IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePurchaseDto {
    @IsString()
    @IsNotEmpty()
    storeId: string;

    @IsString()
    @IsNotEmpty()
    storeName: string;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsNumber()
    @IsNotEmpty()
    totalAmount: number;

    @IsNumber()
    @IsNotEmpty()
    discount: number;

    @IsString()
    @IsNotEmpty()
    accessKey: string;

    @IsString()
    @IsOptional()
    @IsIn(['iFood', '99', 'store', 'marketplace', 'online_store'])
    purchaseType?: 'iFood' | '99' | 'store' | 'marketplace' | 'online_store';
}
