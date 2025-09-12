import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';
import { InvestmentTransactionSchema } from './schemas/investment-transaction.schema';
import { InvestmentSchema } from './schemas/investment.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Investment', schema: InvestmentSchema },
            { name: 'InvestmentTransaction', schema: InvestmentTransactionSchema },
        ]),
    ],
    controllers: [InvestmentsController],
    providers: [InvestmentsService],
    exports: [InvestmentsService],
})
export class InvestmentsModule {}
