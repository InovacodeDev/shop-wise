import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CreditTransactionsController } from './credit-transactions.controller';
import { CreditTransactionsService } from './credit-transactions.service';
import { CreditTransactionSchema } from './schemas/credit-transaction.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'CreditTransaction', schema: CreditTransactionSchema }])],
    controllers: [CreditTransactionsController],
    providers: [CreditTransactionsService],
    exports: [CreditTransactionsService],
})
export class CreditTransactionsModule {}
