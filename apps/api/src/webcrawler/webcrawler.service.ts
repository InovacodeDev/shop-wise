import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

import { AiService } from '../ai/ai.service';
import { NfceDataDto } from './dto/nfce-data.dto';

@Injectable()
export class WebcrawlerService {
    private readonly logger = new Logger(WebcrawlerService.name);

    constructor(private readonly aiService: AiService) {}

    private readonly ALLOWED_NFCE_URL_PATTERN = 'https://sat.sef.sc.gov.br/tax.NET/Sat.DFe.NFCe.Web/';

    /**
     * Validates if the URL is from the allowed NFCe domain
     * @param url The URL to validate
     * @throws BadRequestException if URL is not from allowed domain
     */
    private validateNfceUrl(url: string): void {
        if (!url || typeof url !== 'string') {
            throw new BadRequestException('Invalid URL provided');
        }

        if (!url.startsWith(this.ALLOWED_NFCE_URL_PATTERN)) {
            throw new BadRequestException(
                `Invalid NFCe URL. Only URLs from ${this.ALLOWED_NFCE_URL_PATTERN} are supported for security reasons.`,
            );
        }
    }

    /**
     * Crawls the NFCe website and extracts structured data using AI
     * @param url The NFCe URL to crawl
     * @returns Extracted NFCe data processed by AI
     */
    async crawlNfce(url: string): Promise<NfceDataDto> {
        this.logger.log(`Starting NFCe crawl for URL: ${url}`);

        // Validate URL before processing
        this.validateNfceUrl(url);

        try {
            // Make HTTP request to the NFCe page
            const response: AxiosResponse<string> = await axios.get(url, {
                timeout: 30000, // 30 second timeout
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                },
            });

            if (response.status !== 200) {
                throw new Error(`HTTP ${response.status}: Failed to fetch NFCe page`);
            }

            this.logger.log('Successfully fetched NFCe page, sending HTML to AI for processing...');

            // Send HTML content directly to AI for extraction
            const aiResult = await this.aiService.extractNfceFromHtml({
                htmlContent: response.data,
                url: url,
            });

            this.logger.log('Successfully extracted NFCe data using AI');

            // Convert AI result to the expected DTO format
            const nfceData: NfceDataDto = {
                products: aiResult.products,
                storeName: aiResult.storeName,
                date: aiResult.date,
                cnpj: aiResult.cnpj,
                address: aiResult.address,
                accessKey: aiResult.accessKey,
                type: aiResult.type,
                nfceNumber: aiResult.nfceNumber,
                series: aiResult.series,
                emissionDateTime: aiResult.emissionDateTime,
                authorizationProtocol: aiResult.authorizationProtocol,
                totalAmount: aiResult.totalAmount,
                paymentMethod: aiResult.paymentMethod,
                amountPaid: aiResult.amountPaid,
            };

            return nfceData;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Error crawling NFCe URL: ${errorMessage}`, errorStack);
            throw new Error(`Failed to crawl NFCe: ${errorMessage}`);
        }
    }
}
