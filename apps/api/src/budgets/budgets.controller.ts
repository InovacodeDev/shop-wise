import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Controller('budgets')
@UseGuards(PassportJwtAuthGuard)
export class BudgetsController {
    constructor(private readonly budgetsService: BudgetsService) {}

    @Post()
    create(@Body() createBudgetDto: CreateBudgetDto, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.budgetsService.create(createBudgetDto, userId);
    }

    @Get()
    findAll(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.budgetsService.findAll(userId);
    }

    @Get('summaries')
    getBudgetSummaries(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.budgetsService.getBudgetSummaries(userId);
    }

    @Get('alerts')
    getBudgetAlerts(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.budgetsService.checkBudgetAlerts(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.budgetsService.findOne(id, userId);
    }

    @Get(':id/progress')
    getBudgetProgress(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.budgetsService.getBudgetProgress(id, userId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.budgetsService.update(id, updateBudgetDto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.budgetsService.remove(id, userId);
    }
}
