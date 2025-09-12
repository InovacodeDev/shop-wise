import { IsDataURI, IsNotEmpty } from 'class-validator';

export class ExtractProductDataDto {
    @IsDataURI()
    @IsNotEmpty()
    receiptImage: string;
}
