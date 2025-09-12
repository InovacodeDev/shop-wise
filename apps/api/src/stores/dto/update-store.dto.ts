import { IsEnum, IsOptional, IsString } from 'class-validator';

import { StoreType } from './create-store.dto';

export class UpdateStoreDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    cnpj?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsEnum(StoreType)
    @IsOptional()
    type?: StoreType;
}
