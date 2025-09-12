import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AnalyzeConsumptionDataDto {
    @IsString()
    @IsNotEmpty()
    consumptionData: string;

    @IsString()
    @IsOptional()
    language?: string;
}
