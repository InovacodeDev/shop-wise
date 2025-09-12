import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { BudgetSchema } from './schemas/budget.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Budget', schema: BudgetSchema },
            { name: 'Expense', schema: {} }, // For aggregation queries
        ]),
    ],
    controllers: [BudgetsController],
    providers: [BudgetsService],
    exports: [BudgetsService],
})
export class BudgetsModule {}
