import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../infra/config/prisma/prisma.service';
import { EventsService } from './events.service';

@Injectable()
export class EventsCronService {
    private readonly logger = new Logger(EventsCronService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventsService: EventsService,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        this.logger.debug('Checking for events to start...');

        const now = new Date();
        const scheduledEvents = await this.prisma.event.findMany({
            where: {
                status: 'SCHEDULED',
            },
            include: {
                products: {
                    orderBy: { order: 'asc' },
                    take: 1,
                },
            },
        });

        for (const event of scheduledEvents) {
            // Combine date and startTime (e.g., "14:30")
            const eventDateTime = new Date(event.date);
            const [hours, minutes] = event.startTime.split(':').map(Number);
            eventDateTime.setHours(hours, minutes, 0, 0);

            if (now >= eventDateTime) {
                this.logger.log(`Starting event ${event.id}: ${event.title}`);
                await this.eventsService.startEvent(event.id, { role: 'ADMIN' });
            }
        }

        // Check for expired lots
        const activeLots = await this.prisma.eventProduct.findMany({
            where: {
                endsAt: {
                    lte: now,
                },
                product: {
                    status: 'AUCTIONED', // Currently being auctioned
                },
            } as any,
        });

        for (const lot of activeLots) {
            this.logger.log(`Auto-ending lot ${lot.id} for event ${lot.eventId}`);
            await this.eventsService.endEventProduct(lot.eventId, lot.id, { role: 'ADMIN' });
        }
    }
}
