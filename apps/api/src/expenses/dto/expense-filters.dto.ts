import { Transform, TransformFnParams } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class ExpenseFiltersDto {
    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsEnum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'other'])
    paymentMethod?: string;

    @IsOptional()
    @IsString()
    accountId?: string;

    @IsOptional()
    @Transform(({ value }: TransformFnParams) => {
        if (value === null || value === undefined || value === '') return undefined;
        const n = Number(String(value));
        return Number.isNaN(n) ? undefined : n;
    })
    @IsNumber()
    limit?: number = 50;

    @IsOptional()
    @Transform(({ value }: TransformFnParams) => {
        if (value === null || value === undefined || value === '') return undefined;
        const n = Number(String(value));
        return Number.isNaN(n) ? undefined : n;
    })
    @IsNumber()
    offset?: number = 0;

    @IsOptional()
    @IsString()
    sortBy?: string = 'date';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}
