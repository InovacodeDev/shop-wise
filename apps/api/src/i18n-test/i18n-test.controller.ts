import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller('i18n-test')
export class I18nTestController {
    @Get()
    getWelcomeMessage(@Req() request: Request) {
        // The language will be detected by the i18n module and available in request.i18nLang
        return {
            message: 'Welcome',
            timestamp: new Date().toISOString(),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            detectedLanguage: (request as any).i18nLang || 'en',
            supportedLanguages: ['en', 'pt', 'es'],
            data: {
                greeting: 'Save',
                info: 'Products',
            },
        };
    }

    @Get('categories')
    getCategories(@Req() request: Request) {
        return {
            message: 'Categories',
            categories: [
                { id: 1, name: 'Meat and Seafood' },
                { id: 2, name: 'Dairy and Chilled' },
                { id: 3, name: 'Beverages' },
            ],
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            lang: (request as any).i18nLang || 'en',
        };
    }
}
