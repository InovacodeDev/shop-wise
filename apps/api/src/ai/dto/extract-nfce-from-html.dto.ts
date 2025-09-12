import { IsNotEmpty, IsString } from 'class-validator';

export class ExtractNfceFromHtmlDto {
    @IsString()
    @IsNotEmpty()
    htmlContent: string;

    @IsString()
    @IsNotEmpty()
    url: string;
}
