import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { StorePreferenceSchema, StoreSchema } from './schemas/store.schema';
import { StorePreferencesService } from './store-preferences.service';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Store', schema: StoreSchema },
            { name: 'StorePreference', schema: StorePreferenceSchema },
        ]),
    ],
    controllers: [StoresController],
    providers: [StoresService, StorePreferencesService, PassportJwtAuthGuard],
    exports: [StoresService, StorePreferencesService],
})
export class StoresModule {}
