import { IsDataURI, IsNotEmpty, Matches } from 'class-validator';

export class ExtractFromReceiptPhotoDto {
    @IsDataURI()
    @IsNotEmpty()
    @Matches(/^data:image\/(jpeg|jpg|png|webp);base64,/, {
        message: 'receiptImage must be a valid data URI for supported image formats (.jpg, .jpeg, .png, .webp)',
    })
    receiptImage: string;
}
