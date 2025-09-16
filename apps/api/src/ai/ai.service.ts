import { Injectable } from '@nestjs/common';
import { sha256 } from 'js-sha256';

import { AnalyzeConsumptionDataDto } from './dto/analyze-consumption-data.dto';
import { ExtractDataFromNfceWebDto } from './dto/extract-data-from-nfce-web.dto';
import { ExtractDataFromPageDto } from './dto/extract-data-from-page.dto';
import { ExtractDataFromPdfDto } from './dto/extract-data-from-pdf.dto';
import { ExtractFromReceiptPhotoDto } from './dto/extract-from-receipt-photo.dto';
import { ExtractNfceFromHtmlDto } from './dto/extract-nfce-from-html.dto';
import { ExtractProductDataDto } from './dto/extract-product-data.dto';
import { SuggestMissingItemsDto } from './dto/suggest-missing-items.dto';
import { AnalyzeConsumptionDataOutput, analyzeConsumptionData } from './flows/analyze-consumption-data';
import { ExtractDataFromNfceWebOutput, extractDataFromNfceWeb } from './flows/extract-data-from-nfce-web';
import { ExtractDataFromPageOutput, extractDataFromPage } from './flows/extract-data-from-page';
import { ExtractDataFromPdfOutput, extractDataFromPdf } from './flows/extract-data-from-pdf';
import { ExtractFromReceiptPhotoOutput, extractFromReceiptPhoto } from './flows/extract-from-receipt-photo';
import { ExtractNfceFromHtmlOutput, extractNfceFromHtml } from './flows/extract-nfce-from-html';
import { ExtractProductDataOutput, extractProductData } from './flows/extract-product-data';
import {
    GenerateShoppingListInput,
    GenerateShoppingListOutput,
    generateShoppingList,
} from './flows/generate-shopping-list';
import { SuggestMissingItemsOutput, suggestMissingItems } from './flows/suggest-missing-items';

@Injectable()
export class AiService {
    async analyzeConsumptionData(input: AnalyzeConsumptionDataDto): Promise<AnalyzeConsumptionDataOutput> {
        return await analyzeConsumptionData(input);
    }

    async extractDataFromPdf(input: ExtractDataFromPdfDto): Promise<ExtractDataFromPdfOutput> {
        return await extractDataFromPdf(input);
    }

    async extractDataFromPage(input: ExtractDataFromPageDto): Promise<ExtractDataFromPageOutput> {
        return await extractDataFromPage(input);
    }

    async extractProductData(input: ExtractProductDataDto): Promise<ExtractProductDataOutput> {
        return await extractProductData(input);
    }

    async extractFromReceiptPhoto(input: ExtractFromReceiptPhotoDto): Promise<ExtractFromReceiptPhotoOutput> {
        const output = await extractFromReceiptPhoto(input);
        if (!output.accessKey) {
            output.accessKey = sha256(
                `${output.storeName}|${output.cnpj}|${output.date}|${output.emissionDateTime}|${output.totalAmount}`,
            );
        }
        return output;
    }

    async suggestMissingItems(input: SuggestMissingItemsDto): Promise<SuggestMissingItemsOutput> {
        return await suggestMissingItems(input);
    }

    async extractDataFromNfceWeb(input: ExtractDataFromNfceWebDto): Promise<ExtractDataFromNfceWebOutput> {
        return await extractDataFromNfceWeb(input);
    }

    async generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
        return await generateShoppingList(input);
    }

    async extractNfceFromHtml(input: ExtractNfceFromHtmlDto): Promise<ExtractNfceFromHtmlOutput> {
        return await extractNfceFromHtml(input);
    }
}
