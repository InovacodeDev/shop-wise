import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AiModule } from '../ai/ai.module';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { PurchaseSchema } from '../purchases/schemas/purchase.schema';
import { StoresModule } from '../stores/stores.module';
import { ShoppingListSchema } from './schemas/shopping-list.schema';
import { ShoppingListItemsController } from './shopping-list-items.controller';
import { ShoppingListItemsService } from './shopping-list-items.service';
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
    controllers: [ShoppingListsController, ShoppingListItemsController],
    providers: [ShoppingListsService, ShoppingListItemsService, PassportJwtAuthGuard],
})
export class ShoppingListsModule {}
