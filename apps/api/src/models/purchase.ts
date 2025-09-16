import { BaseModel, ID } from './common';
import { ProductUnit } from './product';

export interface Purchase extends BaseModel {
    familyId: ID; // family._id
    purchasedBy: ID; // user._id
    storeId: ID; // store._id
    accessKey: string;
    storeName?: string; // store.name
    date?: Date;
    totalAmount?: number;
    discount?: number;
    purchaseType?: 'iFood' | '99' | 'store' | 'marketplace' | 'online_store';
    items?: Array<PurchaseItem>;
}

export interface PurchaseItem {
    productId: string; // product._id (renamed from _id)
    name: string;
    description?: string;
    barcode?: string;
    brand?: string;
    category: string;
    subCategory?: string;
    unit: ProductUnit;
    quantity: number;
    price: number;
    total: number; // price * quantity
}
