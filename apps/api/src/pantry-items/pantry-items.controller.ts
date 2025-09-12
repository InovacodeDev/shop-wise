import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';
import { PantryItemsService } from './pantry-items.service';

@Controller('families/:familyId/pantry-items')
@UseGuards(PassportJwtAuthGuard)
export class PantryItemsController {
    constructor(private readonly pantryItemsService: PantryItemsService) {}

    @Post()
    create(@Body() createPantryItemDto: CreatePantryItemDto, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = typeof user._id === 'string' ? user._id : String(user.uid);
        const familyId = String(user.familyId);
        return this.pantryItemsService.create(familyId, createPantryItemDto, userId);
    }

    @Get()
    findAll(@Param('familyId') familyId: string) {
        return this.pantryItemsService.findAll(familyId);
    }

    @Get(':id')
    findOne(@Param('familyId') familyId: string, @Param('id') id: string) {
        return this.pantryItemsService.findOne(familyId, id);
    }

    @Patch(':id')
    update(
        @Param('familyId') familyId: string,
        @Param('id') id: string,
        @Body() updatePantryItemDto: UpdatePantryItemDto,
        @Req() req: AuthenticatedRequest,
    ) {
        const user = req.user!;
        const userId = typeof user._id === 'string' ? user._id : String(user.uid);
        return this.pantryItemsService.update(familyId, id, updatePantryItemDto, userId);
    }

    @Delete(':id')
    remove(@Param('familyId') familyId: string, @Param('id') id: string) {
        return this.pantryItemsService.remove(familyId, id);
    }
}
