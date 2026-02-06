import { Controller, Get, Post, Delete, Param, UseGuards, Request, Body } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';

@Controller('watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
    constructor(private readonly watchlistService: WatchlistService) { }

    @Post()
    toggle(@Body() createWatchlistDto: CreateWatchlistDto, @Request() req) {
        return this.watchlistService.toggle(req.user.id, createWatchlistDto.productId);
    }

    @Get()
    findAll(@Request() req) {
        return this.watchlistService.findAll(req.user.id);
    }

    @Delete(':productId')
    remove(@Param('productId') productId: string, @Request() req) {
        return this.watchlistService.remove(req.user.id, productId);
    }
}
