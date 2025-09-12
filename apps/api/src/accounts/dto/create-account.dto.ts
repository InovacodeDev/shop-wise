import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    currentBalance?: number = 0;

    @IsEnum(['checking', 'savings', 'wallet', 'investment', 'credit_card', 'other'])
    @IsNotEmpty()
    type: 'checking' | 'savings' | 'wallet' | 'investment' | 'credit_card' | 'other';

    @IsString()
    @IsOptional()
    institution?: string;

    @IsString()
    @IsOptional()
    accountNumber?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean = true;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    iconName?: string;
}
