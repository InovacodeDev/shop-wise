import { ID } from '@/models/common';
import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { PurchaseItem } from '../models/purchase';
import { CreatePurchaseItemDto } from './dto/create-purchase-item.dto';
import { UpdatePurchaseItemDto } from './dto/update-purchase-item.dto';
import { PurchaseItemsService } from './purchase-items.service';

@Controller('families/:familyId/purchases/:purchaseId/items')
@UseGuards(PassportJwtAuthGuard)
export class PurchaseItemsController {
    constructor(private readonly purchaseItemsService: PurchaseItemsService) {}

    @Post()
    create(
        @Param('familyId') familyId: string,
        @Param('purchaseId') purchaseId: string,
        @Body() createPurchaseItemDto: CreatePurchaseItemDto,
    ) {
        if (!familyId || !purchaseId) {
            throw new BadRequestException('Invalid id');
        }

        return this.purchaseItemsService.create(familyId, purchaseId, createPurchaseItemDto);
    }

    @Get()
    findAll(@Param('familyId') familyId: string, @Param('purchaseId') purchaseId: string) {
        if (!familyId || !purchaseId) {
            throw new BadRequestException('Invalid id');
        }
        return this.purchaseItemsService.findAll(familyId, purchaseId);
    }

    @Get(':id')
    findOne(@Param('familyId') familyId: string, @Param('purchaseId') purchaseId: string, @Param('id') id: string) {
        if (!familyId || !purchaseId || !id) {
            throw new BadRequestException('Invalid id');
        }
        return this.purchaseItemsService.findOne(familyId, purchaseId, id);
    }

    @Patch('bulk')
    bulkUpdate(
        @Param('familyId') familyId: string,
        @Param('purchaseId') purchaseId: string,
        @Body() body: { items: any[] },
    ) {
        if (!familyId || !purchaseId) {
            throw new BadRequestException('Invalid id');
        }
        return this.purchaseItemsService.bulkUpdate(
            familyId,
            purchaseId,
            (body.items || []) as unknown as (PurchaseItem & { _id?: ID })[],
        );
    }

    @Delete('bulk')
    bulkDelete(
        @Param('familyId') familyId: string,
        @Param('purchaseId') purchaseId: string,
        @Body() body: { itemIds: string[] },
    ) {
        if (!familyId || !purchaseId) {
            throw new BadRequestException('Invalid id');
        }
        const ids = (body.itemIds || []).filter(Boolean).map((s) => s);
        return this.purchaseItemsService.bulkRemove(familyId, purchaseId, ids);
    }

    @Patch(':id')
    update(
        @Param('familyId') familyId: string,
        @Param('purchaseId') purchaseId: string,
        @Param('id') id: string,
        @Body() updatePurchaseItemDto: UpdatePurchaseItemDto,
    ) {
        if (!familyId || !purchaseId || !id) {
            throw new BadRequestException('Invalid id');
        }
        return this.purchaseItemsService.update(familyId, purchaseId, id, updatePurchaseItemDto);
    }

    @Delete(':id')
    remove(@Param('familyId') familyId: string, @Param('purchaseId') purchaseId: string, @Param('id') id: string) {
        if (!familyId || !purchaseId || !id) {
            throw new BadRequestException('Invalid id');
        }
        return this.purchaseItemsService.remove(familyId, purchaseId, id);
    }
}
