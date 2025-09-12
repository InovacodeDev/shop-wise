import { BaseModel } from './common';

export interface Store extends BaseModel {
    name: string;
    cnpj: string;
    address?: string;
    phone?: string;
    location?: StoreLocation;
}

export interface StoreLocation {
    latitude: number;
    longitude: number;
}
