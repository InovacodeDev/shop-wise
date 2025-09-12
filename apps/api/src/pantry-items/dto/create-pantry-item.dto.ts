import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePantryItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    productName: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsString()
    @IsNotEmpty()
    @IsEnum(['kg', 'un', 'l'], { message: 'Unit must be either kg, un, or l' })
    unit: string;
}
