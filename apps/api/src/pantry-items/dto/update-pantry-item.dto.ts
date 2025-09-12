import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePantryItemDto {
    @IsString()
    @IsOptional()
    productId?: string;

    @IsString()
    @IsOptional()
    productName?: string;

    @IsNumber()
    @IsOptional()
    quantity?: number;

    @IsString()
    @IsOptional()
    unit?: string;
}
