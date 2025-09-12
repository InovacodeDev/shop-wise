import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateCreditCardDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @Length(4, 4)
    @IsNotEmpty()
    lastFourDigits: string;

    @IsEnum(['visa', 'mastercard', 'amex', 'elo', 'other'])
    @IsNotEmpty()
    cardType: 'visa' | 'mastercard' | 'amex' | 'elo' | 'other';

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsNotEmpty()
    creditLimit: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(1)
    @Max(31)
    @IsNotEmpty()
    dueDay: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(1)
    @Max(31)
    @IsNotEmpty()
    closingDay: number;

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
