import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SignInDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    totp?: string;
}
