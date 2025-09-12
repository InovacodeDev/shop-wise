import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';
import { WebcrawlerController } from './webcrawler.controller';
import { WebcrawlerService } from './webcrawler.service';

@Module({
    imports: [AiModule],
    controllers: [WebcrawlerController],
    providers: [WebcrawlerService],
    exports: [WebcrawlerService],
})
export class WebcrawlerModule {}
