import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { CreateStoreDto } from './dto/create-store.dto';
import { CreateStorePreferenceDto, UpdateStorePreferenceDto } from './dto/store-preference.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StorePreferencesService } from './store-preferences.service';
import { StoresService } from './stores.service';

@Controller('stores')
@UseGuards(PassportJwtAuthGuard)
export class StoresController {
    constructor(
        private readonly storesService: StoresService,
        private readonly storePreferencesService: StorePreferencesService,
    ) {}

    @Post()
    create(@Body() createStoreDto: CreateStoreDto) {
        return this.storesService.create(createStoreDto);
    }

    @Get()
    findAll() {
        return this.storesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.storesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
        return this.storesService.update(id, updateStoreDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.storesService.remove(id);
    }

    // Store Preferences endpoints
    @Post('preferences/:familyId')
    createOrUpdatePreference(
        @Param('familyId') familyId: string,
        @Body() createStorePreferenceDto: CreateStorePreferenceDto,
    ) {
        return this.storePreferencesService.createOrUpdate(familyId, createStorePreferenceDto);
    }

    @Get('preferences/:familyId')
    getPreferences(@Param('familyId') familyId: string) {
        return this.storePreferencesService.findAllByFamily(familyId);
    }

    @Get('preferences/:familyId/favorites')
    getFavoriteStores(@Param('familyId') familyId: string) {
        return this.storePreferencesService.getFavoriteStores(familyId);
    }

    @Get('preferences/:familyId/ignored')
    getIgnoredStores(@Param('familyId') familyId: string) {
        return this.storePreferencesService.getIgnoredStores(familyId);
    }

    @Get('preferences/:familyId/:storeId')
    getPreference(@Param('familyId') familyId: string, @Param('storeId') storeId: string) {
        return this.storePreferencesService.findOne(familyId, storeId);
    }

    @Patch('preferences/:familyId/:storeId')
    updatePreference(
        @Param('familyId') familyId: string,
        @Param('storeId') storeId: string,
        @Body() updateStorePreferenceDto: UpdateStorePreferenceDto,
    ) {
        return this.storePreferencesService.update(familyId, storeId, updateStorePreferenceDto);
    }

    @Delete('preferences/:familyId/:storeId')
    removePreference(@Param('familyId') familyId: string, @Param('storeId') storeId: string) {
        return this.storePreferencesService.remove(familyId, storeId);
    }
}
