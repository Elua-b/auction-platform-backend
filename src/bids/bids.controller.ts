import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('bids')
export class BidsController {
    constructor(private readonly bidsService: BidsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createBidDto: CreateBidDto, @Request() req) {
        return this.bidsService.create(createBidDto, req.user.id);
    }

    @Get('auction/:auctionId')
    findByAuction(@Param('auctionId') auctionId: string) {
        return this.bidsService.findByAuction(auctionId);
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.bidsService.findByUser(userId);
    }

    @Get('event-product/:eventProductId')
    findByEventProduct(@Param('eventProductId') eventProductId: string) {
        return this.bidsService.findByEventProduct(eventProductId);
    }
}
