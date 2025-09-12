import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ShoppingListStatus } from './create-shopping-list.dto';

export class UpdateShoppingListDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(ShoppingListStatus)
    @IsOptional()
    status?: ShoppingListStatus;
}
