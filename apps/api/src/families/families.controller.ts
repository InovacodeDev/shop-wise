import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-request.interface';
import { PassportJwtAuthGuard } from '../auth/passport-auth.guard';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { FamiliesService } from './families.service';

@Controller('families')
@UseGuards(PassportJwtAuthGuard)
export class FamiliesController {
    constructor(private readonly familiesService: FamiliesService) {}

    @Post()
    create(@Body() createFamilyDto: CreateFamilyDto, @Req() req: AuthenticatedRequest) {
        const user = req.user!;
        const ownerId = user.uid;
        return this.familiesService.create(createFamilyDto, ownerId);
    }

    @Get()
    findAll() {
        return this.familiesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.familiesService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateFamilyDto: UpdateFamilyDto) {
        return this.familiesService.update(id, updateFamilyDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.familiesService.remove(id);
    }
}
