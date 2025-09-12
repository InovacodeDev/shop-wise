import { Controller, Get } from '@nestjs/common';

import { TokenMetricsService } from '../auth';

@Controller()
export class MetricsController {
    constructor(private readonly tokenMetrics: TokenMetricsService) {}

    @Get('/metrics')
    async metrics(): Promise<string> {
        return this.tokenMetrics.metricsContent();
    }
}
