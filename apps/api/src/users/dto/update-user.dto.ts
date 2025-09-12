import { IsEmail, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    displayName?: string;

    @IsString()
    @IsOptional()
    familyId?: string;

    @IsObject()
    @IsOptional()
    settings?: Record<string, any>;
}
