import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuctionsService } from './auctions.service';
import { PrismaService } from '../infra/config/prisma/prisma.service';

@Injectable()
export class AuctionsCronService {
    private readonly logger = new Logger(AuctionsCronService.name);

    constructor(
        private readonly auctionsService: AuctionsService,
        private readonly prisma: PrismaService,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        this.logger.debug('Checking for auctions to end...');

        const now = new Date();
        const auctionsToEnd = await this.prisma.auction.findMany({
            where: {
                status: 'ACTIVE',
                endTime: {
                    lte: now,
                },
            },
            select: { id: true },
        });

        for (const auction of auctionsToEnd) {
            this.logger.log(`Ending auction ${auction.id}`);
            await this.auctionsService.endAuction(auction.id);
        }

        // Start UPCOMING auctions
        const auctionsToStart = await this.prisma.auction.findMany({
            where: {
                status: 'UPCOMING',
                startTime: {
                    lte: now,
                },
            },
            select: { id: true },
        });

        for (const auction of auctionsToStart) {
            this.logger.log(`Starting auction ${auction.id}`);
            await this.auctionsService.updateStatus(auction.id, 'ACTIVE');
        }
    }
}
