import { CategoriesService } from '@/categories/categories.service';
import { CategorySchema } from '@/categories/schemas/category.schema';
import { PurchaseItemSchema } from '@/purchase-items/schemas/purchase-item.schema';
import { UserSchema } from '@/users/schemas/user.schema';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthGuard } from '../auth/auth.guard';
import { CategoriesModule } from '../categories/categories.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { StoresModule } from '../stores/stores.module';
import { MonthlyPurchasesCacheService } from './cache/monthly-purchases-cache.service';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { PurchaseSchema } from './schemas/purchase.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Purchase', schema: PurchaseSchema },
            { name: 'PurchaseItem', schema: PurchaseItemSchema },
            { name: 'Category', schema: CategorySchema },
            { name: 'User', schema: UserSchema },
        ]),
        forwardRef(() => CategoriesModule),
        forwardRef(() => ExpensesModule),
        forwardRef(() => StoresModule),
    ],
    controllers: [PurchasesController],
    providers: [PurchasesService, AuthGuard, MonthlyPurchasesCacheService, CategoriesService],
})
export class PurchasesModule {}
