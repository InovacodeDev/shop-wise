import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { GoalDepositSchema } from './schemas/goal-deposit.schema';
import { GoalSchema } from './schemas/goal.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Goal', schema: GoalSchema },
            { name: 'GoalDeposit', schema: GoalDepositSchema },
        ]),
    ],
    controllers: [GoalsController],
    providers: [GoalsService],
    exports: [GoalsService],
})
export class GoalsModule {}
