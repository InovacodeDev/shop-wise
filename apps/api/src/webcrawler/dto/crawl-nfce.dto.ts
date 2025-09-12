import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CrawlNfceDto {
    @IsNotEmpty()
    @IsString()
    @IsUrl()
    url: string;
}
