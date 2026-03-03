import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request, Delete } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('auctions')
export class AuctionsController {
    constructor(private readonly auctionsService: AuctionsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    create(@Body() data: { productId: string; startTime: Date; endTime: Date }, @Request() req) {
        return this.auctionsService.create(data, req.user.id);
    }

    @Get()
    findAll(@Query('status') status?: string) {
        return this.auctionsService.findAll(status);
    }

    @Get('seller/:sellerId')
    findBySeller(@Param('sellerId') sellerId: string) {
        return this.auctionsService.findBySeller(sellerId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.auctionsService.findOne(id);
    }

    @Get(':id/winner')
    getWinner(@Param('id') id: string) {
        return this.auctionsService.getWinner(id);
    }

    @Post(':id/finalize')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    finalize(@Param('id') id: string) {
        return this.auctionsService.finalize(id);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.auctionsService.updateStatus(id, status);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    remove(@Param('id') id: string, @Request() req) {
        return this.auctionsService.remove(id, req.user);
    }
}
