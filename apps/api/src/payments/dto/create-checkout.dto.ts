import { IsArray, IsEmail, IsEnum, IsObject, IsOptional, IsString, IsUrl } from 'class-validator';

export enum CheckoutMode {
    PAYMENT = 'payment',
    SUBSCRIPTION = 'subscription',
    SETUP = 'setup',
}

export class CreateCheckoutDto {
    @IsArray()
    @IsString({ each: true })
    priceIds: string[];

    @IsOptional()
    @IsString()
    familyId?: string;

    @IsOptional()
    @IsEmail()
    customerEmail?: string;

    @IsOptional()
    @IsUrl()
    successUrl?: string;

    @IsOptional()
    @IsUrl()
    cancelUrl?: string;

    @IsOptional()
    @IsEnum(CheckoutMode)
    mode?: CheckoutMode;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @IsOptional()
    @IsObject()
    customerBillingAddress?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country: string;
    };
}
