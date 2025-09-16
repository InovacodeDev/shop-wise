import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

// import { AuthGuard } from './auth/auth.guard'; // Temporarily disabled

@Controller()
// @UseGuards(AuthGuard) // Temporarily disabled for i18n testing
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
}
