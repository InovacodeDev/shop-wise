import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { FamiliesController } from './families.controller';
import { FamiliesService } from './families.service';
import { FamilySchema } from './schemas/family.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Family', schema: FamilySchema }])],
    controllers: [FamiliesController],
    providers: [FamiliesService, PassportJwtAuthGuard],
    exports: [FamiliesService],
})
export class FamiliesModule {}
