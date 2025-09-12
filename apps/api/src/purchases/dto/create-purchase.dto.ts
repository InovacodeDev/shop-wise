import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
}
