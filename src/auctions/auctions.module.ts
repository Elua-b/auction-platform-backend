import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { AuctionsCronService } from './auctions-cron.service';
import { PrismaModule } from '../infra/config/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BidsModule } from '../bids/bids.module';

@Module({
    imports: [PrismaModule, NotificationsModule, BidsModule],
    controllers: [AuctionsController],
    providers: [AuctionsService, AuctionsCronService],
    exports: [AuctionsService],
})
export class AuctionsModule { }
