import { IsDataURI, IsNotEmpty } from 'class-validator';

export class ExtractDataFromPageDto {
    @IsDataURI()
    @IsNotEmpty()
    pageDataUri: string;
}
