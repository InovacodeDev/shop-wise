import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateGoalDepositDto {
    @IsString()
    @IsNotEmpty()
    goalId: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsOptional()
    depositDate?: string;

    @IsString()
    @IsOptional()
    source?: string;
}
