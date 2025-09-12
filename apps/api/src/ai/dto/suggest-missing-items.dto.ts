import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SuggestMissingItemsDto {
    @IsString()
    @IsNotEmpty()
    purchaseHistory: string;

    @IsNumber()
    @IsNotEmpty()
    familySize: number;
}
