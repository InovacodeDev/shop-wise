import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFamilyDto {
    @IsString()
    @IsNotEmpty()
    familyName: string;
}
