import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { PantryItemsController } from './pantry-items.controller';
import { PantryItemsService } from './pantry-items.service';
import { PantryItemSchema } from './schemas/pantry-item.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'PantryItem', schema: PantryItemSchema }])],
    controllers: [PantryItemsController],
    providers: [PantryItemsService, PassportJwtAuthGuard],
})
export class PantryItemsModule {}
