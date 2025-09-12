import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateGoalDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsNotEmpty()
    targetAmount: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsOptional()
    currentAmount?: number = 0;

    @IsDateString()
    @IsNotEmpty()
    targetDate: string;

    @IsEnum(['low', 'medium', 'high', 'urgent'])
    @IsOptional()
    priority?: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

    @IsString()
    @IsOptional()
    category?: string;

    @IsBoolean()
    @IsOptional()
    isCompleted?: boolean = false;

    @IsDateString()
    @IsOptional()
    completedDate?: string;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    iconName?: string;
}
