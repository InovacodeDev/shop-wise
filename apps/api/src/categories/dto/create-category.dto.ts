import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsObject()
    @IsNotEmpty()
    names: Record<string, string>;

    @IsString()
    @IsNotEmpty()
    colorLight: string;

    @IsString()
    @IsNotEmpty()
    colorDark: string;

    @IsString()
    @IsNotEmpty()
    iconName: string;
}
