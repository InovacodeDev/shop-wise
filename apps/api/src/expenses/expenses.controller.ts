import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseFiltersDto } from './dto/expense-filters.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
@UseGuards(PassportJwtAuthGuard)
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) {}

    @Post()
    create(@Body() createExpenseDto: CreateExpenseDto, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.expensesService.create(createExpenseDto, userId);
    }

    @Get()
    findAll(@Req() req: AuthenticatedRequest, @Query() filters: ExpenseFiltersDto) {
        const user = req.user!;
        const userId = user.uid;
        return this.expensesService.findAll(userId, filters);
    }

    @Get('summary')
    getExpensesSummary(@Req() req: AuthenticatedRequest, @Query('month') month?: string) {
        const user = req.user!;
        const userId = user.uid;
        return this.expensesService.getExpensesSummary(userId, month);
    }

    @Get('monthly/:year')
    getMonthlyExpenses(@Req() req: AuthenticatedRequest, @Param('year') year: string) {
        const user = req.user!;
        const userId = user.uid;
        return this.expensesService.getMonthlyExpenses(userId, parseInt(year));
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.expensesService.findOne(id, userId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.expensesService.update(id, updateExpenseDto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.expensesService.remove(id, userId);
    }
}
