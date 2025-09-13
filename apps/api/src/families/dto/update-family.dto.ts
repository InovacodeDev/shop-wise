import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { type FamilyComposition } from '../../models/family';

export enum FamilyPlan {
    FREE = 'free',
    PRO = 'pro',
    PREMIUM = 'premium',
}

export class UpdateFamilyDto {
    @IsString()
    @IsOptional()
    familyName?: string;

    @IsEnum(FamilyPlan)
    @IsOptional()
    plan?: FamilyPlan;

    @IsDateString()
    @IsOptional()
    planExpiresAt?: Date;

    @IsOptional()
    familyComposition?: FamilyComposition;
}
