import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { CreateGoalDepositDto } from './dto/create-goal-deposit.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDepositDto } from './dto/update-goal-deposit.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GoalsService } from './goals.service';

@Controller('goals')
@UseGuards(PassportJwtAuthGuard)
export class GoalsController {
    constructor(private readonly goalsService: GoalsService) {}

    // Goals CRUD
    @Post()
    create(@Body() createGoalDto: CreateGoalDto, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.goalsService.create(createGoalDto, userId);
    }

    @Get()
    findAll(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.goalsService.findAll(userId);
    }

    @Get('summary')
    getGoalsSummary(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.goalsService.getGoalsSummary(userId);
    }

    @Get('upcoming-deadlines')
    getUpcomingDeadlines(@Req() req: AuthenticatedRequest, @Query('days') days?: string) {
        const user = req.user!;
        const userId = user.uid;
        return this.goalsService.getUpcomingDeadlines(userId, days ? parseInt(days) : 30);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.goalsService.findOne(id, userId);
    }

    @Get(':id/progress')
    getGoalProgress(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.goalsService.getGoalProgress(id, userId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateGoalDto: UpdateGoalDto, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.goalsService.update(id, updateGoalDto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.goalsService.remove(id, userId);
    }

    // Goal Deposits
    @Post('deposits')
    createDeposit(@Body() createGoalDepositDto: CreateGoalDepositDto, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.goalsService.createDeposit(createGoalDepositDto, userId);
    }

    @Get(':goalId/deposits')
    findDepositsByGoal(@Param('goalId') goalId: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.goalsService.findDepositsByGoal(goalId, userId);
    }

    @Patch('deposits/:id')
    updateDeposit(
        @Param('id') id: string,
        @Body() updateGoalDepositDto: UpdateGoalDepositDto,
        @Req() req: AuthenticatedRequest,
    ) {
        const user = req.user!;
        const userId = user.uid;
        return this.goalsService.updateDeposit(id, updateGoalDepositDto, userId);
    }

    @Delete('deposits/:id')
    removeDeposit(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.goalsService.removeDeposit(id, userId);
    }
}
