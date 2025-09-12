import { BaseModel, ID } from './common';
import { ProductUnit } from './product';

export interface PantryItem extends BaseModel {
    familyId: ID; // family._id
    productId?: ID; // product._id
    productName?: string; // product.name
    addedBy?: ID; // user._id
    quantity?: number;
    unit?: ProductUnit;
    lastUpdatedAt?: Date;
}
