export class UpdateShoppingListItemDto {
    productId?: string;
    name?: string;
    quantity?: number;
    unit?: string;
    isCompleted?: boolean;
    checked?: boolean;
    notes?: string;
    estimatedPrice?: number;
}
