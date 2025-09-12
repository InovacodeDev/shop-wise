import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CreditCardsController } from './credit-cards.controller';
import { CreditCardsService } from './credit-cards.service';
import { CreditCardSchema } from './schemas/credit-card.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'CreditCard', schema: CreditCardSchema }])],
    controllers: [CreditCardsController],
    providers: [CreditCardsService],
    exports: [CreditCardsService],
})
export class CreditCardsModule {}
