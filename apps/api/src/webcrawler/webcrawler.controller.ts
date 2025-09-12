import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AiService } from '../ai/ai.service';
import { ExtractDataFromNfceWebOutput } from '../ai/flows/extract-data-from-nfce-web';
import { CrawlNfceDto } from './dto/crawl-nfce.dto';
import { EnhancedNfceResponseDto } from './dto/enhanced-nfce-response.dto';
import { NfceDataDto } from './dto/nfce-data.dto';
import { WebcrawlerService } from './webcrawler.service';

@Controller('webcrawler')
@UseGuards(AuthGuard('jwt'))
export class WebcrawlerController {
    constructor(
        private readonly webcrawlerService: WebcrawlerService,
        private readonly aiService: AiService,
    ) {}

    @Post('nfce')
    async crawlNfce(@Body() crawlNfceDto: CrawlNfceDto): Promise<NfceDataDto> {
        return this.webcrawlerService.crawlNfce(crawlNfceDto.url);
    }

    @Post('nfce/enhanced')
    async crawlAndEnhanceNfce(@Body() crawlNfceDto: CrawlNfceDto): Promise<EnhancedNfceResponseDto> {
        try {
            // First, crawl the NFCe data
            const rawNfceData = await this.webcrawlerService.crawlNfce(crawlNfceDto.url);

            // Then, enhance it using AI
            const enhancedData: ExtractDataFromNfceWebOutput = await this.aiService.extractDataFromNfceWeb({
                rawNfceData,
            });

            // Calculate total amount from products or use original value
            const totalAmount =
                rawNfceData.totalAmount || enhancedData.products.reduce((sum, product) => sum + product.price, 0);

            // Transform the AI response to match the frontend expectations
            const response: EnhancedNfceResponseDto = {
                success: true,
                data: {
                    purchase: {
                        products: enhancedData.products.map((product) => ({
                            barcode: product.barcode,
                            name: product.name,
                            quantity: product.quantity,
                            price: product.price,
                            unitPrice: product.unitPrice,
                            volume: product.volume,
                            category: product.category,
                            subcategory: product.subcategory,
                            brand: product.brand,
                        })),
                        storeName: enhancedData.storeName,
                        date: enhancedData.date,
                        totalAmount,
                    },
                    store: {
                        name: enhancedData.storeName,
                        cnpj: enhancedData.cnpj,
                        address: enhancedData.address,
                        type: enhancedData.type,
                    },
                    // Extract unique categories from products
                    categories: [...new Set(enhancedData.products.map((p) => p.category).filter(Boolean))].map(
                        (category) => ({ name: category }),
                    ),
                },
            };

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
}
