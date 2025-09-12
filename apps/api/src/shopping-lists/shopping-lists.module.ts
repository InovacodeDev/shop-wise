import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AiModule } from '../ai/ai.module';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { PurchaseSchema } from '../purchases/schemas/purchase.schema';
import { StoresModule } from '../stores/stores.module';
import { ShoppingListSchema } from './schemas/shopping-list.schema';
import { ShoppingListsController } from './shopping-lists.controller';
import { ShoppingListsService } from './shopping-lists.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'ShoppingList', schema: ShoppingListSchema },
            { name: 'Purchase', schema: PurchaseSchema },
        ]),
        AiModule,
        forwardRef(() => StoresModule),
    ],
    controllers: [ShoppingListsController],
    providers: [ShoppingListsService, PassportJwtAuthGuard],
})
export class ShoppingListsModule {}
