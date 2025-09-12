import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountsModule } from './accounts/accounts.module';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BudgetsModule } from './budgets/budgets.module';
import { CategoriesModule } from './categories/categories.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { CreditTransactionsModule } from './credit-transactions/credit-transactions.module';
import { ExpensesModule } from './expenses/expenses.module';
import { FamiliesModule } from './families/families.module';
import { GoalsModule } from './goals/goals.module';
import { InvestmentsModule } from './investments/investments.module';
import { MetricsController } from './metrics/metrics.controller';
import { MongoModule } from './mongo/mongo.module';
import { PantryItemsModule } from './pantry-items/pantry-items.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';
import { PurchaseItemsModule } from './purchase-items/purchase-items.module';
import { PurchasesModule } from './purchases/purchases.module';
import { ShoppingListsModule } from './shopping-lists/shopping-lists.module';
import { StoresModule } from './stores/stores.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UserSchema } from './users/schemas/user.schema';
import { UsersModule } from './users/users.module';
import { WebcrawlerModule } from './webcrawler/webcrawler.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                uri: config.get<string>('MONGODB_URI') ?? '',
                dbName: config.get<string>('MONGODB_NAME'),
            }),
        }),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        MongoModule,
        AuthModule,
        AccountsModule,
        BudgetsModule,
        CategoriesModule,
        CreditCardsModule,
        CreditTransactionsModule,
        ExpensesModule,
        GoalsModule,
        InvestmentsModule,
        PaymentsModule,
        SubscriptionsModule,
        FamiliesModule,
        UsersModule,
        ProductsModule,
        PantryItemsModule,
        PurchasesModule,
        PurchaseItemsModule,
        ShoppingListsModule,
        StoresModule,
        AiModule,
        WebcrawlerModule,
    ],
    controllers: [AppController, MetricsController],
    providers: [AppService],
})
export class AppModule {}
