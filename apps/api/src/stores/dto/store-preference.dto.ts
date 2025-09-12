import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStorePreferenceDto {
    @IsString()
    @IsNotEmpty()
    storeId: string;

    @IsEnum(['favorite', 'ignored', 'neutral'])
    preference: 'favorite' | 'ignored' | 'neutral';
}

export class UpdateStorePreferenceDto {
    @IsEnum(['favorite', 'ignored', 'neutral'])
    @IsOptional()
    preference?: 'favorite' | 'ignored' | 'neutral';
}
