import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum ShoppingListStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
}

export class CreateShoppingListDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(ShoppingListStatus)
    @IsNotEmpty()
    status: ShoppingListStatus;
}
