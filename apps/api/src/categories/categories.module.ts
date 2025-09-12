import { UserSchema } from '@/users/schemas/user.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthGuard } from '../auth/auth.guard';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategorySchema } from './schemas/category.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ],
    controllers: [CategoriesController],
    providers: [CategoriesService, AuthGuard],
})
export class CategoriesModule {}
