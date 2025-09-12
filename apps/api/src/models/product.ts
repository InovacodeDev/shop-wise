import { BaseModel } from './common';

export interface Product extends BaseModel {
    name: string;
    description?: string;
    barcode?: string;
    brand?: string;
    category: string;
    subCategory?: string;
    unit: ProductUnit; // 'kg', 'l' for weight/volume, 'un' for unit
}

export type ProductUnit = 'kg' | 'l' | 'un';
