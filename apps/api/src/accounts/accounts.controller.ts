import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
@UseGuards(PassportJwtAuthGuard)
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @Post()
    create(@Body() createAccountDto: CreateAccountDto, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.accountsService.create(createAccountDto, userId);
    }

    @Get()
    findAll(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.accountsService.findAll(userId);
    }

    @Get('summary')
    getAccountsSummary(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.accountsService.getAccountsSummary(userId);
    }

    @Get('balance')
    getTotalBalance(@Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.accountsService.getTotalBalance(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.accountsService.findOne(id, userId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.accountsService.update(id, updateAccountDto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const userId = user.uid;
        return this.accountsService.remove(id, userId);
    }
}
