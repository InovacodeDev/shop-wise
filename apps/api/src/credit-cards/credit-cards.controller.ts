import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { CreditCardsService } from './credit-cards.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';

@Controller('credit-cards')
@UseGuards(PassportJwtAuthGuard)
export class CreditCardsController {
    constructor(private readonly creditCardsService: CreditCardsService) {}

    @Post()
    create(@Body() createCreditCardDto: CreateCreditCardDto, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditCardsService.create(createCreditCardDto, userId);
    }

    @Get()
    findAll(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditCardsService.findAll(userId);
    }

    @Get('summary')
    getCreditCardsSummary(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditCardsService.getCreditCardsSummary(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditCardsService.findOne(id, userId);
    }

    @Get(':id/next-invoice')
    getNextInvoice(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditCardsService.calculateNextInvoice(id, userId);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateCreditCardDto: UpdateCreditCardDto,
        @Req() req: AuthenticatedRequest,
    ) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditCardsService.update(id, updateCreditCardDto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditCardsService.remove(id, userId);
    }
}
