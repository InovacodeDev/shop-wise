import { IsDataURI, IsNotEmpty } from 'class-validator';

export class ExtractDataFromPdfDto {
    @IsDataURI()
    @IsNotEmpty()
    pdfDataUri: string;
}
