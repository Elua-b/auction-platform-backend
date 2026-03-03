import { Controller, Get, Post, Body, Param, Patch, Query, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    create(@Body() data: { title: string; description?: string; date: Date; startTime: string }, @Request() req) {
        return this.eventsService.create({ ...data, sellerId: req.user.id });
    }

    @Get()
    findAll(@Query('status') status?: string, @Query('sellerId') sellerId?: string) {
        return this.eventsService.findAll(status, sellerId);
    }

    @Get(':id/live-status')
    getLiveStatus(@Param('id') id: string) {
        return this.eventsService.getLiveStatus(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Post(':id/products')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    addProduct(@Param('id') id: string, @Body() data: { productId: string; order: number }, @Request() req) {
        return this.eventsService.addProductToEvent(id, data.productId, data.order, req.user);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req) {
        return this.eventsService.updateStatus(id, status, req.user);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    update(@Param('id') id: string, @Body() data: { title?: string; description?: string; date?: Date; startTime?: string }, @Request() req) {
        return this.eventsService.update(id, data, req.user);
    }

    @Post(':id/start')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    startEvent(@Param('id') id: string, @Request() req) {
        return this.eventsService.startEvent(id, req.user);
    }

    @Post(':id/end')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    endEvent(@Param('id') id: string, @Request() req) {
        return this.eventsService.endEvent(id, req.user);
    }

    @Post(':id/products/:eventProductId/activate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    activateProduct(@Param('id') id: string, @Param('eventProductId') eventProductId: string, @Body('duration') duration: number, @Request() req) {
        return this.eventsService.activateProduct(id, eventProductId, duration, req.user);
    }

    @Post(':id/products/:eventProductId/end')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    endProduct(@Param('id') id: string, @Param('eventProductId') eventProductId: string, @Request() req) {
        return this.eventsService.endEventProduct(id, eventProductId, req.user);
    }

    @Delete(':id/products/:eventProductId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    removeProduct(@Param('id') id: string, @Param('eventProductId') eventProductId: string, @Request() req) {
        return this.eventsService.removeProductFromEvent(id, eventProductId, req.user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    remove(@Param('id') id: string, @Request() req) {
        return this.eventsService.remove(id, req.user);
    }
}
