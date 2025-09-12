import { Module } from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
    imports: [],
    controllers: [AiController],
    providers: [AiService, PassportJwtAuthGuard],
    exports: [AiService],
})
export class AiModule {}
