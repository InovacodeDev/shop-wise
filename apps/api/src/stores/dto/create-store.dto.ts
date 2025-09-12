import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum StoreType {
    SUPERMERCADO = 'supermercado',
    ATACADO = 'atacado',
    FEIRA = 'feira',
    MARKETPLACE = 'marketplace',
    ACOUGUE = 'acougue',
    PADARIA = 'padaria',
    FARMACIA = 'farmacia',
    OUTRO = 'outro',
}

export class CreateStoreDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    cnpj?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsEnum(StoreType)
    @IsNotEmpty()
    type: StoreType;

    // @IsLatLong()
    // location: Geolocation;
}
