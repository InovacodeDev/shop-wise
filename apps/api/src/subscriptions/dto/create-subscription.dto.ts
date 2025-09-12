import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreateSubscriptionDto {
    @IsString()
    @IsNotEmpty()
    planId: string;

    @IsEnum(['active', 'canceled', 'expired', 'trial', 'past_due'])
    @IsOptional()
    status?: 'active' | 'canceled' | 'expired' | 'trial' | 'past_due' = 'trial';

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsBoolean()
    @IsOptional()
    autoRenew?: boolean = true;

    @IsString()
    @IsOptional()
    paymentMethod?: string;

    @IsDateString()
    @IsOptional()
    lastPaymentDate?: string;

    @IsDateString()
    @IsOptional()
    nextPaymentDate?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsOptional()
    currency?: string = 'BRL';

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    features?: string[];
}
