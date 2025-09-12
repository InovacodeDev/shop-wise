import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateInvestmentTransactionDto {
    @IsString()
    @IsNotEmpty()
    investmentId: string;

    @IsEnum(['buy', 'sell', 'dividend', 'interest', 'bonus'])
    @IsNotEmpty()
    type: 'buy' | 'sell' | 'dividend' | 'interest' | 'bonus';

    @IsNumber({ maxDecimalPlaces: 4 })
    @IsNotEmpty()
    quantity: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsNotEmpty()
    price: number;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsOptional()
    fees?: number;

    @IsString()
    @IsOptional()
    notes?: string;
}
