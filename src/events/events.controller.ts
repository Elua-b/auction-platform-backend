import { Controller, Get, Post, Body, Param, Patch, Query, Delete } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    create(@Body() data: { title: string; description?: string; date: Date; startTime: string }) {
        return this.eventsService.create(data);
    }

    @Get()
    findAll(@Query('status') status?: string) {
        return this.eventsService.findAll(status);
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
    addProduct(@Param('id') id: string, @Body() data: { productId: string; order: number }) {
        return this.eventsService.addProductToEvent(id, data.productId, data.order);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.eventsService.updateStatus(id, status);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: { title?: string; description?: string; date?: Date; startTime?: string }) {
        return this.eventsService.update(id, data);
    }

    @Post(':id/start')
    startEvent(@Param('id') id: string) {
        return this.eventsService.startEvent(id);
    }

    @Post(':id/end')
    endEvent(@Param('id') id: string) {
        return this.eventsService.endEvent(id);
    }

    @Post(':id/activate-product/:eventProductId')
    activateProduct(@Param('id') id: string, @Param('eventProductId') eventProductId: string, @Body('duration') duration: number) {
        return this.eventsService.activateProduct(id, eventProductId, duration);
    }

    @Post(':id/end-product/:eventProductId')
    endProduct(@Param('id') id: string, @Param('eventProductId') eventProductId: string) {
        return this.eventsService.endEventProduct(id, eventProductId);
    }

    @Delete(':id/products/:eventProductId')
    removeProduct(@Param('id') id: string, @Param('eventProductId') eventProductId: string) {
        return this.eventsService.removeProductFromEvent(id, eventProductId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.eventsService.remove(id);
    }
}
