import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { AvailableMonth, AvailableMonthsSummary } from '../models/available-month';
import { MonthlyPurchaseGroup } from '../models/monthly-purchase-group';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PurchasesService } from './purchases.service';

@Controller('families/:familyId/purchases')
@UseGuards(PassportJwtAuthGuard)
export class PurchasesController {
    constructor(private readonly purchasesService: PurchasesService) {}

    @Post()
    create(
        @Param('familyId') familyId: string,
        @Body() createPurchaseDto: CreatePurchaseDto,
        @Req() req: AuthenticatedRequest,
    ) {
        const user = req.user!;
        const userId = user.uid;
        return this.purchasesService.create(familyId, createPurchaseDto, userId);
    }

    @Get()
    findAll(@Param('familyId') familyId: string) {
        return this.purchasesService.findAll(familyId);
    }

    @Get('by-month')
    async findAllByMonth(@Param('familyId') familyId: string): Promise<MonthlyPurchaseGroup[]> {
        try {
            return await this.purchasesService.findAllByMonth(familyId);
        } catch (error) {
            // Log the error for monitoring
            console.error(`Error fetching monthly purchases for family ${familyId}:`, error);

            // Re-throw to let NestJS handle the HTTP response
            throw error;
        }
    }

    @Get('available-months')
    async getAvailableMonths(@Param('familyId') familyId: string): Promise<AvailableMonth[]> {
        try {
            return await this.purchasesService.getAvailableMonths(familyId);
        } catch (error) {
            console.error(`Error fetching available months for family ${familyId}:`, error);
            throw error;
        }
    }

    @Get('available-months/summary')
    async getAvailableMonthsSummary(@Param('familyId') familyId: string): Promise<AvailableMonthsSummary> {
        try {
            return await this.purchasesService.getAvailableMonthsSummary(familyId);
        } catch (error) {
            console.error(`Error fetching available months summary for family ${familyId}:`, error);
            throw error;
        }
    }

    @Get('family-items')
    async getAllFamilyPurchaseItems(@Param('familyId') familyId: string) {
        try {
            return await this.purchasesService.getAllPurchaseItemsByFamily(familyId);
        } catch (error) {
            console.error(`Error fetching all family purchase items for family ${familyId}:`, error);
            throw error;
        }
    }

    @Get(':id')
    findOne(@Param('familyId') familyId: string, @Param('id') id: string) {
        return this.purchasesService.findOne(familyId, id);
    }

    @Patch(':id')
    update(@Param('familyId') familyId: string, @Param('id') id: string, @Body() updatePurchaseDto: UpdatePurchaseDto) {
        return this.purchasesService.update(familyId, id, updatePurchaseDto);
    }

    @Delete(':id')
    remove(@Param('familyId') familyId: string, @Param('id') id: string) {
        return this.purchasesService.remove(familyId, id);
    }

    @Post(':id/convert-to-expenses')
    convertToExpenses(
        @Param('familyId') familyId: string,
        @Param('id') id: string,
        @Req() req: AuthenticatedRequest,
        @Body() body: { accountId?: string },
    ) {
        const user = req.user!;
        const userId = user.uid;
        return this.purchasesService.convertPurchaseToExpenses(id, userId, body.accountId);
    }
}
