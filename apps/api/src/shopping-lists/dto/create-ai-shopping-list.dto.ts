import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateAiShoppingListDto {
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    familySize: number;

    @IsString()
    @IsOptional()
    preferences?: string;

    @IsString()
    @IsOptional()
    listName?: string;
}
