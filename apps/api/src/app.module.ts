import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountsModule } from './accounts/accounts.module';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BudgetsModule } from './budgets/budgets.module';
import { CategoriesModule } from './categories/categories.module';
import { EmailModule } from './common/email.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { CreditTransactionsModule } from './credit-transactions/credit-transactions.module';
import { ExpensesModule } from './expenses/expenses.module';
import { FamiliesModule } from './families/families.module';
import { GoalsModule } from './goals/goals.module';
import { I18nTestController } from './i18n-test/i18n-test.controller';
import { I18nCustomModule } from './i18n/i18n.module';
import { InvestmentsModule } from './investments/investments.module';
import { PantryItemsModule } from './pantry-items/pantry-items.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';
import { PurchaseItemsModule } from './purchase-items/purchase-items.module';
import { PurchasesModule } from './purchases/purchases.module';
import { ShoppingListsModule } from './shopping-lists/shopping-lists.module';
import { StoresModule } from './stores/stores.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UsersModule } from './users/users.module';
import { WebcrawlerModule } from './webcrawler/webcrawler.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '../../.env',
        }),
        MongooseModule.forRootAsync({
            useFactory: () => ({
                uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shop-wise-fallback',
                dbName: process.env.MONGODB_NAME,
            }),
        }),
        I18nCustomModule,
        EmailModule,
        AuthModule,
        UsersModule,
        FamiliesModule,
        CategoriesModule,
        ProductsModule,
        StoresModule,
        PurchasesModule,
        PurchaseItemsModule,
        ShoppingListsModule,
        PantryItemsModule,
        AccountsModule,
        BudgetsModule,
        CreditCardsModule,
        CreditTransactionsModule,
        ExpensesModule,
        GoalsModule,
        InvestmentsModule,
        PaymentsModule,
        SubscriptionsModule,
        AiModule,
        WebcrawlerModule,
    ],
    controllers: [AppController, I18nTestController], // AuthTestController temporarily disabled
    providers: [AppService],
})
export class AppModule {}
