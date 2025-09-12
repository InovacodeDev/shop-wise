import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
    @IsObject()
    @IsOptional()
    names?: Record<string, string>;

    @IsString()
    @IsOptional()
    colorLight?: string;

    @IsString()
    @IsOptional()
    colorDark?: string;

    @IsString()
    @IsOptional()
    iconName?: string;
}
