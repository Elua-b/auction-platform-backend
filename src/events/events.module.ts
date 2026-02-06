import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaModule } from '../infra/config/prisma/prisma.module';
import { BidsModule } from '../bids/bids.module';

import { EventsCronService } from './events-cron.service';

@Module({
    imports: [PrismaModule, BidsModule],
    controllers: [EventsController],
    providers: [EventsService, EventsCronService],
    exports: [EventsService],
})
export class EventsModule { }
