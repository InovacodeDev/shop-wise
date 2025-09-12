import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCreditTransactionDto {
    @IsString()
    @IsNotEmpty()
    cardId: string;

    @IsString()
    @IsNotEmpty()
    expenseId: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsDateString()
    @IsNotEmpty()
    transactionDate: string;

    @IsDateString()
    @IsNotEmpty()
    dueDate: string;

    @IsBoolean()
    @IsOptional()
    isPaid?: boolean = false;

    @IsDateString()
    @IsOptional()
    paidDate?: string;

    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(1)
    @IsOptional()
    installmentNumber?: number;

    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(1)
    @IsOptional()
    totalInstallments?: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsOptional()
    monthlyAmount?: number;
}
