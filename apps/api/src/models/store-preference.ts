import { BaseModel, ID } from './common';

export interface Store extends BaseModel {
    name: string;
    cnpj: string;
    address?: string;
    phone?: string;
}

export interface StorePreference extends BaseModel {
    familyId: ID;
    storeId: ID;
    preference: 'favorite' | 'ignored' | 'neutral';
    lastPurchaseDate?: Date;
    purchaseCount: number;
}

export type StorePreferenceType = 'favorite' | 'ignored' | 'neutral';
