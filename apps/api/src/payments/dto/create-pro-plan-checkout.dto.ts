import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ProPlanType {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}

export class CreateProPlanCheckoutDto {
    /**
     * Type of pro plan subscription
     */
    @IsNotEmpty()
    @IsEnum(ProPlanType)
    planType: ProPlanType;

    /**
     * Customer email for billing
     */
    @IsNotEmpty()
    @IsEmail()
    customerEmail: string;

    /**
     * Success URL to redirect after payment
     */
    @IsNotEmpty()
    @IsString()
    successUrl: string;

    /**
     * Optional family ID to upgrade
     */
    @IsOptional()
    @IsString()
    familyId?: string;

    /**
     * Optional customer ID if already exists
     */
    @IsOptional()
    @IsString()
    customerId?: string;

    /**
     * Optional metadata for the transaction
     */
    @IsOptional()
    metadata?: Record<string, any>;
}
