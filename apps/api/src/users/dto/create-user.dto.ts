import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    displayName: string;

    @IsString()
    @IsOptional()
    familyId?: string;

    @IsObject()
    @IsOptional()
    settings?: Record<string, any>;
}
