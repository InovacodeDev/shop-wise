import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { AiService } from './ai.service';
import { AnalyzeConsumptionDataDto } from './dto/analyze-consumption-data.dto';
import { ExtractDataFromNfceWebDto } from './dto/extract-data-from-nfce-web.dto';
import { ExtractDataFromPageDto } from './dto/extract-data-from-page.dto';
import { ExtractDataFromPdfDto } from './dto/extract-data-from-pdf.dto';
import { ExtractFromReceiptPhotoDto } from './dto/extract-from-receipt-photo.dto';
import { ExtractProductDataDto } from './dto/extract-product-data.dto';
import { SuggestMissingItemsDto } from './dto/suggest-missing-items.dto';

@Controller('ai')
@UseGuards(PassportJwtAuthGuard)
export class AiController {
    constructor(private readonly aiService: AiService) {}

    @Post('analyze-consumption')
    analyzeConsumptionData(@Body() body: AnalyzeConsumptionDataDto) {
        return this.aiService.analyzeConsumptionData(body);
    }

    @Post('extract-from-pdf')
    extractDataFromPdf(@Body() body: ExtractDataFromPdfDto) {
        return this.aiService.extractDataFromPdf(body);
    }

    @Post('extract-from-page')
    extractDataFromPage(@Body() body: ExtractDataFromPageDto) {
        return this.aiService.extractDataFromPage(body);
    }

    @Post('extract-from-product-qr')
    extractProductData(@Body() body: ExtractProductDataDto) {
        return this.aiService.extractProductData(body);
    }

    @Post('extract-from-receipt-photo')
    extractFromReceiptPhoto(@Body() body: ExtractFromReceiptPhotoDto) {
        return this.aiService.extractFromReceiptPhoto(body);
    }

    @Post('suggest-missing-items')
    suggestMissingItems(@Body() body: SuggestMissingItemsDto) {
        return this.aiService.suggestMissingItems(body);
    }

    @Post('extract-from-nfce-web')
    extractDataFromNfceWeb(@Body() body: ExtractDataFromNfceWebDto) {
        return this.aiService.extractDataFromNfceWeb(body);
    }
}
