import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { CreateShoppingListItemDto } from './dto/create-shopping-list-item.dto';
import { UpdateShoppingListItemDto } from './dto/update-shopping-list-item.dto';
import { ShoppingListItemsService } from './shopping-list-items.service';

@Controller('families/:familyId/shopping-lists/:listId/items')
@UseGuards(PassportJwtAuthGuard)
export class ShoppingListItemsController {
    constructor(private readonly shoppingListItemsService: ShoppingListItemsService) {}

    @Post()
    create(
        @Param('familyId') familyId: string,
        @Param('listId') listId: string,
        @Body() createShoppingListItemDto: CreateShoppingListItemDto,
    ) {
        return this.shoppingListItemsService.create(familyId, listId, createShoppingListItemDto);
    }

    @Get()
    findAll(@Param('familyId') familyId: string, @Param('listId') listId: string) {
        return this.shoppingListItemsService.findAll(familyId, listId);
    }

    @Get(':itemId')
    findOne(@Param('familyId') familyId: string, @Param('listId') listId: string, @Param('itemId') itemId: string) {
        return this.shoppingListItemsService.findOne(familyId, listId, itemId);
    }

    @Patch(':itemId')
    update(
        @Param('familyId') familyId: string,
        @Param('listId') listId: string,
        @Param('itemId') itemId: string,
        @Body() updateShoppingListItemDto: UpdateShoppingListItemDto,
    ) {
        return this.shoppingListItemsService.update(familyId, listId, itemId, updateShoppingListItemDto);
    }

    @Delete(':itemId')
    remove(@Param('familyId') familyId: string, @Param('listId') listId: string, @Param('itemId') itemId: string) {
        return this.shoppingListItemsService.remove(familyId, listId, itemId);
    }
}
