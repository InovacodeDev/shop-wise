import { BaseModel, ID } from './common';

export interface Family extends BaseModel {
    // DTOs call this familyName
    familyName: string;
    ownerId: ID; // user._id
    plan?: 'free' | 'premium' | 'pro';
    planExpiresAt?: Date | null;
    familyComposition?: FamilyComposition;
}

export interface FamilyComposition {
    adults: number;
    children: number;
    pets: number;
}
