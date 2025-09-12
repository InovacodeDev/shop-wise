import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateInvestmentDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(['stocks', 'bonds', 'funds', 'crypto', 'real_estate', 'other'])
    @IsNotEmpty()
    type: 'stocks' | 'bonds' | 'funds' | 'crypto' | 'real_estate' | 'other';

    @IsString()
    @IsNotEmpty()
    asset: string;

    @IsNumber({ maxDecimalPlaces: 4 })
    @Min(0)
    @IsNotEmpty()
    quantity: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsNotEmpty()
    averagePrice: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsOptional()
    currentPrice?: number;

    @IsString()
    @IsOptional()
    broker?: string;

    @IsString()
    @IsOptional()
    notes?: string;

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
