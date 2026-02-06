import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/config/prisma/prisma.service';
import { BiddingGateway } from '../bids/bidding.gateway';

@Injectable()
export class EventsService {
    private lotTimeouts = new Map<string, any>(); // Map of eventProductId -> Timeout

    constructor(
        private prisma: PrismaService,
        private biddingGateway: BiddingGateway,
    ) { }

    async create(data: { title: string; description?: string; date: Date; startTime: string }) {
        return this.prisma.event.create({
            data: {
                ...data,
                status: 'SCHEDULED',
            },
        });
    }

    async findAll(status?: string) {
        return this.prisma.event.findMany({
            where: {
                ...(status && { status }),
            },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.event.findUnique({
            where: { id },
            include: {
                products: {
                    include: {
                        product: {
                            include: {
                                category: true,
                                seller: { select: { name: true, avatar: true } },
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
    }

    async addProductToEvent(eventId: string, productId: string, order: number) {
        return this.prisma.eventProduct.create({
            data: {
                eventId,
                productId,
                order,
            },
        });
    }

    async removeProductFromEvent(id: string, eventProductId: string) {
        return this.prisma.eventProduct.delete({
            where: { id: eventProductId },
        });
    }

    async updateStatus(id: string, status: string) {
        return this.prisma.event.update({
            where: { id },
            data: { status },
        });
    }

    async startEvent(id: string) {
        const event = await this.prisma.event.update({
            where: { id },
            data: { status: 'LIVE' },
        });
        this.biddingGateway.broadcastEventUpdate(id, { type: 'EVENT_STARTED', status: 'LIVE' });
        return event;
    }

    async endEvent(id: string) {
        const event = await this.prisma.event.update({
            where: { id },
            data: { status: 'COMPLETED' },
        });
        this.biddingGateway.broadcastEventUpdate(id, { type: 'EVENT_ENDED', status: 'COMPLETED' });
        return event;
    }

    async activateProduct(eventId: string, eventProductId: string, durationMinutes: number) {
        const endsAt = new Date(Date.now() + durationMinutes * 60000);

        // Clear existing timeout if any
        if (this.lotTimeouts.has(eventProductId)) {
            clearTimeout(this.lotTimeouts.get(eventProductId));
            this.lotTimeouts.delete(eventProductId);
        }

        const eventProduct = await this.prisma.eventProduct.update({
            where: { id: eventProductId },
            data: {
                endsAt,
                durationLimit: durationMinutes * 60 // store in seconds for convenience
            } as any,
            include: { product: true },
        });

        if (!eventProduct) throw new Error('Event product not found');

        await this.prisma.product.update({
            where: { id: (eventProduct as any).productId },
            data: { status: 'AUCTIONED' }, // Temporarily mark as auctioned while live
        });

        this.biddingGateway.broadcastEventUpdate(eventId, {
            type: 'PRODUCT_ACTIVATED',
            eventProductId,
            product: (eventProduct as any).product,
            endsAt: (eventProduct as any).endsAt,
        });

        // Set automatic end timer
        const timer = setTimeout(() => {
            this.endEventProduct(eventId, eventProductId).catch(err => {
                console.error(`Failed to auto-end product ${eventProductId}:`, err);
            });
        }, durationMinutes * 60000);

        this.lotTimeouts.set(eventProductId, timer);

        return eventProduct;
    }

    async endEventProduct(eventId: string, eventProductId: string) {
        // Clear timeout if this was called manually
        if (this.lotTimeouts.has(eventProductId)) {
            clearTimeout(this.lotTimeouts.get(eventProductId));
            this.lotTimeouts.delete(eventProductId);
        }

        const eventProduct = await this.prisma.eventProduct.findUnique({
            where: { id: eventProductId },
            include: {
                bids: {
                    orderBy: { amount: 'desc' },
                    take: 1,
                    include: { user: true },
                },
                product: true,
            },
        });

        if (!eventProduct) throw new Error('Event product not found');

        const winner = (eventProduct as any).bids[0];

        await this.prisma.$transaction(async (tx) => {
            if (winner) {
                await tx.product.update({
                    where: { id: (eventProduct as any).productId },
                    data: { status: 'SOLD' },
                });

                await tx.order.create({
                    data: {
                        userId: winner.userId,
                        productId: (eventProduct as any).productId,
                        amount: winner.amount,
                        paymentStatus: 'PENDING',
                        shippingStatus: 'NOT_SHIPPED',
                    },
                });
            } else {
                await tx.product.update({
                    where: { id: (eventProduct as any).productId },
                    data: { status: 'AVAILABLE' },
                });
            }
        });

        this.biddingGateway.broadcastEventUpdate(eventId, {
            type: 'PRODUCT_ENDED',
            eventProductId,
            winner: winner ? {
                userId: winner.userId,
                name: winner.user.name,
                amount: winner.amount
            } : null,
        });

        return { winner };
    }

    async getLiveStatus(id: string) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                products: {
                    include: {
                        product: {
                            include: {
                                category: true,
                                seller: { select: { name: true, avatar: true } },
                            },
                        },
                        bids: {
                            orderBy: { amount: 'desc' },
                            take: 1,
                            include: { user: { select: { name: true, avatar: true } } },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!event) throw new Error('Event not found');

        // Logic to determine "current" product could be based on time or manual trigger.
        // For now, we return the first active product (one that hasn't been sold yet or matches current index)
        const currentEventProduct = event.products.find(p => p.product.status === 'AVAILABLE') || event.products[0];

        return {
            eventId: event.id,
            status: event.status,
            currentProduct: currentEventProduct?.product || null,
            highestBid: currentEventProduct?.bids?.[0] || null,
            totalProducts: event.products.length,
        };
    }

    async update(id: string, data: { title?: string; description?: string; date?: Date; startTime?: string }) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        });

        if (!event) {
            throw new Error('Event not found');
        }

        if (event.status === 'LIVE' || event.status === 'ENDED') {
            throw new Error('Cannot update live or ended events');
        }

        return this.prisma.event.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: { products: true },
        });

        if (!event) {
            throw new Error('Event not found');
        }

        if (event.status === 'LIVE' || event.status === 'ENDED') {
            throw new Error('Cannot delete live or ended events');
        }

        // Remove all event products first
        await this.prisma.eventProduct.deleteMany({
            where: { eventId: id },
        });

        return this.prisma.event.delete({
            where: { id },
        });
    }
}
