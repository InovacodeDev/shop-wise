import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PlanSchema } from './schemas/plan.schema';
import { SubscriptionSchema } from './schemas/subscription.schema';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Subscription', schema: SubscriptionSchema },
            { name: 'Plan', schema: PlanSchema },
        ]),
    ],
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService],
    exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
