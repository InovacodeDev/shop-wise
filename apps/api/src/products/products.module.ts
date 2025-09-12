import { UserSchema } from '@/users/schemas/user.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthGuard } from '../auth/auth.guard';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductSchema } from './schemas/product.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ],
    controllers: [ProductsController],
    providers: [ProductsService, AuthGuard],
})
export class ProductsModule {}
