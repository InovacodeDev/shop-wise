import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { CreditTransactionsService } from './credit-transactions.service';
import { CreateCreditTransactionDto } from './dto/create-credit-transaction.dto';
import { UpdateCreditTransactionDto } from './dto/update-credit-transaction.dto';

@Controller('credit-transactions')
@UseGuards(PassportJwtAuthGuard)
export class CreditTransactionsController {
    constructor(private readonly creditTransactionsService: CreditTransactionsService) {}

    @Post()
    create(@Body() createCreditTransactionDto: CreateCreditTransactionDto, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditTransactionsService.create(createCreditTransactionDto, userId);
    }

    @Get()
    findAll(@Req() req: AuthenticatedRequest, @Query('cardId') cardId?: string) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditTransactionsService.findAll(userId, cardId);
    }

    @Get('summary')
    getCreditTransactionsSummary(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditTransactionsService.getCreditTransactionsSummary(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditTransactionsService.findOne(id, userId);
    }

    @Post(':id/mark-paid')
    markAsPaid(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditTransactionsService.markAsPaid(id, userId);
    }

    @Get('invoice/:cardId/:month')
    generateInvoice(@Param('cardId') cardId: string, @Param('month') month: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditTransactionsService.generateInvoice(cardId, userId, month);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateCreditTransactionDto: UpdateCreditTransactionDto,
        @Req() req: AuthenticatedRequest,
    ) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditTransactionsService.update(id, updateCreditTransactionDto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.creditTransactionsService.remove(id, userId);
    }
}
