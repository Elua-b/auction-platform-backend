import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/config/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BiddingGateway } from '../bids/bidding.gateway';

@Injectable()
export class AuctionsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
        private biddingGateway: BiddingGateway,
    ) { }

    async create(data: { productId: string; startTime: string | Date; endTime: string | Date }, sellerId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id: data.productId },
        });

        if (!product) {
            throw new Error('Product not found');
        }

        if (product.sellerId !== sellerId) {
            throw new Error('You do not own this product');
        }

        // Convert string dates to Date objects if needed
        const startTime = typeof data.startTime === 'string' ? new Date(data.startTime) : data.startTime;
        const endTime = typeof data.endTime === 'string' ? new Date(data.endTime) : data.endTime;

        return this.prisma.auction.create({
            data: {
                productId: data.productId,
                startTime,
                endTime,
                status: 'UPCOMING',
            },
        });
    }

    async findAll(status?: string) {
        return this.prisma.auction.findMany({
            where: {
                ...(status && { status }),
            },
            include: {
                product: {
                    include: {
                        category: true,
                        seller: {
                            select: { name: true, avatar: true },
                        },
                    },
                },
                _count: {
                    select: { bids: true },
                },
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.auction.findUnique({
            where: { id },
            include: {
                product: {
                    include: {
                        category: true,
                        seller: true,
                    },
                },
                bids: {
                    include: {
                        user: { select: { name: true, avatar: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
    }

    async findBySeller(sellerId: string) {
        return this.prisma.auction.findMany({
            where: {
                product: {
                    sellerId,
                },
            },
            include: {
                product: {
                    include: {
                        category: true,
                    },
                },
                _count: {
                    select: { bids: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateStatus(id: string, status: string) {
        const auction = await this.prisma.auction.update({
            where: { id },
            data: { status },
        });

        // Broadcast status change to all connected clients
        this.biddingGateway.broadcastAuctionStatusChange(id, {
            status,
            startTime: auction.startTime,
            endTime: auction.endTime,
        });

        return auction;
    }

    async endAuction(id: string) {
        const auction = await this.prisma.auction.findUnique({
            where: { id },
            include: {
                bids: {
                    orderBy: { amount: 'desc' },
                    take: 1,
                    include: { user: true },
                },
                product: { include: { seller: true } },
            },
        });

        if (!auction || auction.status !== 'ACTIVE') return;

        const winner = auction.bids[0];

        await this.prisma.$transaction(async (tx) => {
            await tx.auction.update({
                where: { id },
                data: { status: 'ENDED' },
            });

            if (winner) {
                await tx.product.update({
                    where: { id: auction.productId },
                    data: { status: 'SOLD' },
                });

                await tx.order.create({
                    data: {
                        userId: winner.userId,
                        productId: auction.productId,
                        amount: winner.amount,
                        paymentStatus: 'PENDING',
                        shippingStatus: 'NOT_SHIPPED',
                    },
                });
            } else {
                await tx.product.update({
                    where: { id: auction.productId },
                    data: { status: 'AVAILABLE' },
                });
            }
        });

        if (winner) {
            await this.notificationsService.notifyAuctionWin(
                winner.userId,
                winner.user.email,
                auction.product.title,
                winner.amount,
                auction.id,
            );
        }

        this.biddingGateway.broadcastAuctionEnded(id, {
            winner: winner ? {
                id: winner.userId,
                name: winner.user.name,
                amount: winner.amount,
            } : null,
            status: 'ENDED',
        });
    }

    async getWinner(id: string) {
        const auction = await this.prisma.auction.findUnique({
            where: { id },
            include: {
                bids: {
                    orderBy: { amount: 'desc' },
                    take: 1,
                    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
                },
                product: true,
            },
        });

        if (!auction) throw new Error('Auction not found');

        const winner = auction.bids[0];
        return {
            auctionId: auction.id,
            winnerId: winner?.userId || null,
            winner: winner?.user || null,
            winningBid: winner?.amount || null,
            productId: auction.productId,
            status: auction.status,
        };
    }

    async finalize(id: string) {
        return this.endAuction(id);
    }

    async remove(id: string, user: any) {
        const auction = await this.prisma.auction.findUnique({
            where: { id },
            include: {
                bids: true,
                product: {
                    select: { sellerId: true }
                }
            },
        });

        if (!auction) {
            throw new Error('Auction not found');
        }

        if (user.role !== 'ADMIN' && auction.product.sellerId !== user.id) {
            throw new ForbiddenException('You do not have permission to delete this auction');
        }

        if (auction.status === 'ACTIVE' || auction.status === 'ENDED') {
            throw new Error('Cannot delete active or ended auctions');
        }

        if (auction.bids.length > 0) {
            throw new Error('Cannot delete auction with existing bids');
        }

        return this.prisma.auction.delete({
            where: { id },
        });
    }
}
