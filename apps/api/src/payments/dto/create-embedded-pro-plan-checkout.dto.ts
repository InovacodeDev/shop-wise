import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export enum ProPlanType {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}

export class BillingAddressDto {
    @IsNotEmpty()
    @IsString()
    line1: string;

    @IsOptional()
    @IsString()
    line2?: string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    state: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{5}(-\d{4})?$/, { message: 'Invalid postal code format' })
    postalCode: string;

    @IsNotEmpty()
    @IsString()
    @Length(2, 2, { message: 'Country code must be 2 characters' })
    country: string;
}

export class CreditCardDto {
    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{13,19}$/, { message: 'Invalid credit card number' })
    cardNumber: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Invalid expiry date format (MM/YY)' })
    expiryDate: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{3,4}$/, { message: 'Invalid CVV' })
    cvv: string;

    @IsNotEmpty()
    @IsString()
    cardholderName: string;
}

export class CreateEmbeddedProPlanCheckoutDto {
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
     * Customer full name
     */
    @IsNotEmpty()
    @IsString()
    customerName: string;

    /**
     * Credit card information
     */
    @IsNotEmpty()
    creditCard: CreditCardDto;

    /**
     * Billing address
     */
    @IsNotEmpty()
    billingAddress: BillingAddressDto;

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
