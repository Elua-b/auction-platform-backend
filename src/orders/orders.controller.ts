import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() data: { productId: string; amount: number }, @Request() req) {
        return this.ordersService.createOrder({
            userId: req.user.id,
            productId: data.productId,
            amount: data.amount,
        });
    }

    @Get('user/me')
    @UseGuards(JwtAuthGuard)
    findMyOrders(@Request() req) {
        return this.ordersService.findByUser(req.user.id);
    }

    @Get('seller/me')
    @UseGuards(JwtAuthGuard)
    findMySales(@Request() req) {
        return this.ordersService.findBySeller(req.user.id);
    }

    // Admin or specific check might be needed for getting any user's orders
    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.ordersService.findByUser(userId);
    }

    @Get('seller/:sellerId')
    findBySeller(@Param('sellerId') sellerId: string) {
        return this.ordersService.findBySeller(sellerId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }
}
