import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/config/prisma/prisma.service';
import { BiddingGateway } from '../bids/bidding.gateway';

@Injectable()
export class EventsService {
    private lotTimeouts = new Map<string, any>(); // Map of eventProductId -> Timeout

    constructor(
        private prisma: PrismaService,
        private biddingGateway: BiddingGateway,
    ) { }

    async create(data: { title: string; description?: string; date: Date; startTime: string; sellerId: string }) {
        return this.prisma.event.create({
            data: {
                ...data,
                status: 'SCHEDULED',
            },
        });
    }

    async findAll(status?: string, sellerId?: string) {
        return this.prisma.event.findMany({
            where: {
                ...(status && { status }),
                ...(sellerId && { sellerId }),
            },
            include: {
                _count: {
                    select: { products: true },
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
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
                seller: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            },
        });
    }

    private async checkOwnership(eventId: string, user: any) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            select: { sellerId: true, status: true }
        });

        if (!event) throw new NotFoundException('Event not found');

        if (user.role !== 'ADMIN' && event.sellerId !== user.id) {
            throw new ForbiddenException('You do not have permission to manage this event');
        }
        return event;
    }

    async addProductToEvent(eventId: string, productId: string, order: number, user: any) {
        await this.checkOwnership(eventId, user);

        // Also check if the product belongs to the seller
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { sellerId: true }
        });

        if (!product) throw new NotFoundException('Product not found');
        if (user.role !== 'ADMIN' && product.sellerId !== user.id) {
            throw new ForbiddenException('You can only add your own products to events');
        }

        return this.prisma.eventProduct.create({
            data: {
                event: { connect: { id: eventId } },
                product: { connect: { id: productId } },
                order,
            },
        });
    }

    async removeProductFromEvent(eventId: string, eventProductId: string, user: any) {
        await this.checkOwnership(eventId, user);
        return this.prisma.eventProduct.delete({
            where: { id: eventProductId },
        });
    }

    async updateStatus(id: string, status: string, user: any) {
        await this.checkOwnership(id, user);
        return this.prisma.event.update({
            where: { id },
            data: { status },
        });
    }

    async startEvent(id: string, user: any) {
        await this.checkOwnership(id, user);
        const event = await this.prisma.event.update({
            where: { id },
            data: { status: 'LIVE' },
        });
        this.biddingGateway.broadcastEventUpdate(id, { type: 'EVENT_STARTED', status: 'LIVE' });
        return event;
    }

    async endEvent(id: string, user: any) {
        await this.checkOwnership(id, user);
        const event = await this.prisma.event.update({
            where: { id },
            data: { status: 'COMPLETED' },
        });
        this.biddingGateway.broadcastEventUpdate(id, { type: 'EVENT_ENDED', status: 'COMPLETED' });
        return event;
    }

    async activateProduct(eventId: string, eventProductId: string, durationMinutes: number, user: any) {
        await this.checkOwnership(eventId, user);
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
            this.endEventProduct(eventId, eventProductId, user).catch(err => {
                console.error(`Failed to auto-end product ${eventProductId}:`, err);
            });
        }, durationMinutes * 60000);

        this.lotTimeouts.set(eventProductId, timer);

        return eventProduct;
    }

    async endEventProduct(eventId: string, eventProductId: string, user: any) {
        // Validation check (can be skipped for auto-end if needed, but safer to keep)
        // Note: For auto-end triggered by system timer, 'user' might be different or null.
        // We'll allow it if 'user' is the owner or if no user is provided (system call)
        if (user) {
            await this.checkOwnership(eventId, user);
        }

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

    async update(id: string, data: { title?: string; description?: string; date?: Date; startTime?: string }, user: any) {
        const event = await this.checkOwnership(id, user);

        if (event.status === 'LIVE' || event.status === 'ENDED') {
            throw new Error('Cannot update live or ended events');
        }

        return this.prisma.event.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, user: any) {
        const event = await this.checkOwnership(id, user);

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
