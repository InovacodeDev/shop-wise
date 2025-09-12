import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { FamiliesModule } from '../families/families.module';
import { PaymentsLifecycleService } from './payments-lifecycle.service';
import { PaymentsController } from './payments.controller';
import { PaymentPollingStatus, PaymentPollingStatusSchema } from './schemas/payment-polling-status.schema';
import { StripeTransaction, StripeTransactionSchema } from './schemas/stripe-transaction.schema';
import { PaymentPollingService } from './services/payment-polling.service';
import { PaymentsService } from './services/payments.service';
import { StripeClientService } from './services/stripe-client.service';

@Module({
    imports: [
        ConfigModule,
        FamiliesModule,
        MongooseModule.forFeature([
            { name: StripeTransaction.name, schema: StripeTransactionSchema },
            { name: PaymentPollingStatus.name, schema: PaymentPollingStatusSchema },
        ]),
    ],
    controllers: [PaymentsController],
    providers: [StripeClientService, PaymentsService, PaymentPollingService, PaymentsLifecycleService],
    exports: [StripeClientService, PaymentsService, PaymentPollingService],
})
export class PaymentsModule {}
