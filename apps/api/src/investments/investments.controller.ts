import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { CreateInvestmentTransactionDto } from './dto/create-investment-transaction.dto';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentTransactionDto } from './dto/update-investment-transaction.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { InvestmentsService } from './investments.service';

@Controller('investments')
@UseGuards(PassportJwtAuthGuard)
export class InvestmentsController {
    constructor(private readonly investmentsService: InvestmentsService) {}

    // Investments CRUD
    @Post()
    create(@Body() createInvestmentDto: CreateInvestmentDto, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.investmentsService.create(createInvestmentDto, userId);
    }

    @Get()
    findAll(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.investmentsService.findAll(userId);
    }

    @Get('portfolio')
    getPortfolio(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.investmentsService.getPortfolio(userId);
    }

    @Get('summary')
    getInvestmentsSummary(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.investmentsService.getInvestmentsSummary(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.investmentsService.findOne(id, userId);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateInvestmentDto: UpdateInvestmentDto,
        @Req() req: AuthenticatedRequest,
    ) {
        const user = req.user!;
        const userId = user.uid;
        return this.investmentsService.update(id, updateInvestmentDto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.investmentsService.remove(id, userId);
    }

    // Investment Transactions
    @Post('transactions')
    createTransaction(
        @Body() createInvestmentTransactionDto: CreateInvestmentTransactionDto,
        @Req() req: AuthenticatedRequest,
    ) {
        const user = req.user!;
        const userId = user.uid;
        return this.investmentsService.createTransaction(createInvestmentTransactionDto, userId);
    }

    @Get(':investmentId/transactions')
    findTransactionsByInvestment(@Param('investmentId') investmentId: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.investmentsService.findTransactionsByInvestment(investmentId, userId);
    }

    @Patch('transactions/:id')
    updateTransaction(
        @Param('id') id: string,
        @Body() updateInvestmentTransactionDto: UpdateInvestmentTransactionDto,
        @Req() req: AuthenticatedRequest,
    ) {
        const user = req.user!;
        const userId = user.uid;
        return this.investmentsService.updateTransaction(id, updateInvestmentTransactionDto, userId);
    }

    @Delete('transactions/:id')
    removeTransaction(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.investmentsService.removeTransaction(id, userId);
    }

    // Price updates (would typically be called by an external service)
    @Post('update-prices')
    updatePrices(@Body() prices: Record<string, number>, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.investmentsService.updatePrices(userId, prices);
    }
}
