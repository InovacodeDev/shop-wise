import { IsOptional, IsString } from 'class-validator';

export class GetPaymentStatusDto {
    @IsString()
    transactionId: string;
}

export class ListUserPaymentsDto {
    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    limit?: string;

    @IsOptional()
    @IsString()
    page?: string;
}
