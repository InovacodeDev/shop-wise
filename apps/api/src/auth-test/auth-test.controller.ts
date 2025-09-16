import { Controller, Get, Query, Req } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Controller('auth')
export class AuthTestController {
    constructor(private readonly i18n: I18nService) {}

    @Get('me')
    getMe(@Query('lang') lang?: string, @Req() req?: any) {
        console.log('[API] AuthTestController.getMe GET /api/auth/me');
        console.log('[API][QUERY] lang:', lang);
        console.log('[API][HEADERS] Accept-Language:', req?.headers?.['accept-language'] || 'none');

        // Mock user data for testing
        const mockUser = {
            id: 'test-user-123',
            email: 'test@example.com',
            name: 'Test User',
            familyId: 'test-family-456',
            preferences: {
                language: lang || 'en',
                currency: 'USD',
            },
        };

        return {
            success: true,
            user: mockUser,
            message: this.i18n.translate('Welcome', {
                lang: lang || 'en',
            }),
            timestamp: new Date().toISOString(),
        };
    }

    @Get('check')
    checkAuth(@Query('lang') lang?: string) {
        console.log('[API] AuthTestController.checkAuth GET /api/auth/check');

        return {
            authenticated: true,
            sessionValid: true,
            message: this.i18n.translate('Welcome', {
                lang: lang || 'en',
            }),
        };
    }
}
