import { Controller, Get, Query } from '@nestjs/common';

type QueryMap = Record<string, string | undefined>;

// Placeholder endpoints for OAuth providers. Implement provider configs and passport strategies as needed.
@Controller('auth/oauth')
export class OauthController {
    @Get('google')
    googleAuth(@Query() q: QueryMap) {
        return { msg: 'Google OAuth placeholder', query: q };
    }

    @Get('apple')
    appleAuth(@Query() q: QueryMap) {
        return { msg: 'Apple OAuth placeholder', query: q };
    }

    @Get('microsoft')
    microsoftAuth(@Query() q: QueryMap) {
        return { msg: 'Microsoft OAuth placeholder', query: q };
    }
}
