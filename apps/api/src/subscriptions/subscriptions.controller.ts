import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
@UseGuards(PassportJwtAuthGuard)
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    // User endpoints
    @Get('current')
    getCurrentSubscription(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.subscriptionsService.getUserSubscription(userId);
    }

    @Get('features')
    getUserFeatures(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.subscriptionsService.getUserFeatures(userId);
    }

    @Get('status')
    getSubscriptionStatus(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.subscriptionsService.checkSubscriptionStatus(userId);
    }

    @Post('upgrade/:planId')
    upgradeSubscription(@Param('planId') planId: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.subscriptionsService.upgradeSubscription(userId, planId);
    }

    @Post(':id/cancel')
    cancelSubscription(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.subscriptionsService.cancelSubscription(id, userId);
    }

    // Admin endpoints (would need additional admin guard)
    @Get('plans')
    findAllPlans() {
        return this.subscriptionsService.findAllPlans();
    }

    @Get('plans/:id')
    findPlan(@Param('id') id: string) {
        return this.subscriptionsService.findPlan(id);
    }

    @Post('plans')
    createPlan(@Body() createPlanDto: CreatePlanDto) {
        return this.subscriptionsService.createPlan(createPlanDto);
    }

    @Patch('plans/:id')
    updatePlan(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
        return this.subscriptionsService.updatePlan(id, updatePlanDto);
    }

    @Delete('plans/:id')
    removePlan(@Param('id') id: string) {
        return this.subscriptionsService.removePlan(id);
    }

    // Internal endpoints
    @Post('initialize-plans')
    initializeDefaultPlans() {
        return this.subscriptionsService.initializeDefaultPlans();
    }
}
