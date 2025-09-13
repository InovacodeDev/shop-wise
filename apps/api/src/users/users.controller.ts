import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(PassportJwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto, @Req() req: AuthenticatedRequest) {
        const user = req.user;
        const uid = user ? String(user.uid) : 'anonymous';
        return this.usersService.create(createUserDto, uid);
    }

    @Get()
    findAll(@Req() req: AuthenticatedRequest) {
        const requestingUserId = req.user?.uid;
        return this.usersService.findAll(requestingUserId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const requestingUserId = req.user?.uid;
        return this.usersService.findOne(id, requestingUserId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: AuthenticatedRequest) {
        // A user should only be able to update their own data.
        // A more robust implementation would check if req.user.uid === id
        const requestingUserId = req.user?.uid;
        return this.usersService.update(id, updateUserDto, requestingUserId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        // A user should only be able to delete their own account.
        // A more robust implementation would check if req.user.uid === id
        const requestingUserId = req.user?.uid;
        return this.usersService.remove(id, requestingUserId);
    }
}
