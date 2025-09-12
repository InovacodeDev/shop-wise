import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountsModule } from '../accounts/accounts.module';
import { CreditCardsModule } from '../credit-cards/credit-cards.module';
import { CreditTransactionsModule } from '../credit-transactions/credit-transactions.module';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { ExpenseSchema } from './schemas/expense.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Expense', schema: ExpenseSchema }]),
        AccountsModule,
        CreditCardsModule,
        CreditTransactionsModule,
    ],
    controllers: [ExpensesController],
    providers: [ExpensesService],
    exports: [ExpensesService],
})
export class ExpensesModule {}
