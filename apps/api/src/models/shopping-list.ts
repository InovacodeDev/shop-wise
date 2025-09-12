import { BaseModel, ID } from './common';

export interface ShoppingList extends BaseModel {
    familyId: ID;
    name?: string;
    createdBy?: ID;
    status?: string;
    items?: Array<ShoppingListItem>;
}

export interface ShoppingListItem {
    id: ID;
    name: string;
    quantity: number;
    purchased: boolean;
}
