import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBudgetDto {
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsNotEmpty()
    limit: number;

    @IsEnum(['weekly', 'monthly', 'quarterly', 'yearly'])
    @IsNotEmpty()
    period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

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
