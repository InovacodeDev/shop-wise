import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateExpenseDto {
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsNotEmpty()
    amount: number;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsEnum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'other'])
    @IsNotEmpty()
    paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'other';

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    accountId?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsBoolean()
    @IsOptional()
    isRecurring?: boolean;

    @IsString()
    @IsOptional()
    recurringId?: string;
}
