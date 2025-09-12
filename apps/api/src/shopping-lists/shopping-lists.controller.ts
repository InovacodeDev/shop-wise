import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { CreateAiShoppingListDto } from './dto/create-ai-shopping-list.dto';
import { CreateShoppingListDto } from './dto/create-shopping-list.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { ShoppingListsService } from './shopping-lists.service';

@Controller('families/:familyId/shopping-lists')
@UseGuards(PassportJwtAuthGuard)
export class ShoppingListsController {
    constructor(private readonly shoppingListsService: ShoppingListsService) {}

    @Post()
    create(
        @Param('familyId') familyId: string,
        @Body() createShoppingListDto: CreateShoppingListDto,
        @Req() req: AuthenticatedRequest,
    ) {
        const user = req.user!;
        const userId = typeof user._id === 'string' ? user._id : String(user.uid);
        return this.shoppingListsService.create(familyId, createShoppingListDto, userId);
    }

    @Post('ai')
    createWithAi(
        @Param('familyId') familyId: string,
        @Body() createAiShoppingListDto: CreateAiShoppingListDto,
        @Req() req: AuthenticatedRequest,
    ) {
        const user = req.user!;
        const userId = typeof user._id === 'string' ? user._id : String(user.uid);
        return this.shoppingListsService.createWithAi(familyId, createAiShoppingListDto, userId);
    }

    @Get()
    findAll(@Param('familyId') familyId: string) {
        return this.shoppingListsService.findAll(familyId);
    }

    @Get(':id')
    findOne(@Param('familyId') familyId: string, @Param('id') id: string) {
        return this.shoppingListsService.findOne(familyId, id);
    }

    @Patch(':id')
    update(
        @Param('familyId') familyId: string,
        @Param('id') id: string,
        @Body() updateShoppingListDto: UpdateShoppingListDto,
    ) {
        return this.shoppingListsService.update(familyId, id, updateShoppingListDto);
    }

    @Delete(':id')
    remove(@Param('familyId') familyId: string, @Param('id') id: string) {
        return this.shoppingListsService.remove(familyId, id);
    }
}
