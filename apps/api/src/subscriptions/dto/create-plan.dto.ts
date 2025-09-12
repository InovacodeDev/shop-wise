import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePlanDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsNotEmpty()
    price: number;

    @IsString()
    @IsOptional()
    currency?: string = 'BRL';

    @IsEnum(['monthly', 'yearly'])
    @IsNotEmpty()
    interval: 'monthly' | 'yearly';

    @IsArray()
    @IsNotEmpty()
    features: Array<{
        name: string;
        description: string;
        code: string;
        isEnabled: boolean;
    }>;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean = true;

    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(1)
    @IsOptional()
    maxUsers?: number;

    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(0)
    @Max(365)
    @IsOptional()
    trialDays?: number = 0;
}
