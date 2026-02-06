import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { BiddingGateway } from './bidding.gateway';
import { PrismaModule } from '../infra/config/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [PrismaModule, NotificationsModule],
    controllers: [BidsController],
    providers: [BidsService, BiddingGateway],
    exports: [BidsService, BiddingGateway],
})
export class BidsModule { }
