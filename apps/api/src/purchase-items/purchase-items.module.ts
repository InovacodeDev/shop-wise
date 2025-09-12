import { ProductSchema } from '@/products/schemas/product.schema';
import { PurchaseSchema } from '@/purchases/schemas/purchase.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PurchaseItemsController } from './purchase-items.controller';
import { PurchaseItemsService } from './purchase-items.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Purchase', schema: PurchaseSchema }]),
        MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    ],
    controllers: [PurchaseItemsController],
    providers: [PurchaseItemsService],
})
export class PurchaseItemsModule {}
