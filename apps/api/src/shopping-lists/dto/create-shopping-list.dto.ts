import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum ShoppingListStatus {
    ACTIVE = 'active',
    CREATED = 'created',
    COMPLETED = 'completed',
    ARCHIVED = 'archived',
}

export class CreateShoppingListDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(ShoppingListStatus)
    @IsNotEmpty()
    status: ShoppingListStatus;
}
