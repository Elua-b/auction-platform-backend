import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/config/prisma/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { BiddingGateway } from './bidding.gateway';

@Injectable()
export class BidsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
        private biddingGateway: BiddingGateway,
    ) { }

    async create(createBidDto: CreateBidDto, userId: string) {
        const { amount, auctionId, eventProductId } = createBidDto;
        // Override userId from DTO
        createBidDto.userId = userId;

        let productId: string;
        let productName: string;

        // Fetch previous highest bid to notify
        const previousBid = await this.prisma.bid.findFirst({
            where: auctionId ? { auctionId } : { eventProductId },
            orderBy: { amount: 'desc' },
            include: { user: true },
        });

        if (auctionId) {
            const auction = await this.prisma.auction.findUnique({
                where: { id: auctionId },
                include: { product: true },
            });

            if (!auction || auction.status !== 'ACTIVE') {
                throw new BadRequestException('Auction is not active');
            }

            if (amount <= auction.product.currentPrice) {
                throw new BadRequestException('Bid must be higher than current price');
            }
            productId = auction.productId;
            productName = auction.product.title;
        } else if (eventProductId) {
            const eventProduct = await this.prisma.eventProduct.findUnique({
                where: { id: eventProductId },
                include: { product: true, event: true },
            });

            if (!eventProduct || eventProduct.event.status !== 'LIVE') {
                throw new BadRequestException('Event is not live');
            }

            if (eventProduct.endsAt && new Date() > new Date(eventProduct.endsAt)) {
                throw new BadRequestException('Bidding for this item has ended');
            }

            if (amount <= eventProduct.product.currentPrice) {
                throw new BadRequestException('Bid must be higher than current price');
            }
            productId = eventProduct.productId;
            productName = eventProduct.product.title;
        } else {
            throw new BadRequestException('Either auctionId or eventProductId must be provided');
        }

        // Use a transaction to create the bid and update the product price
        const bid = await this.prisma.$transaction(async (tx) => {
            const newBid = await tx.bid.create({
                data: createBidDto,
            });

            await tx.product.update({
                where: { id: productId },
                data: { currentPrice: amount },
            });

            return newBid;
        });

        if (previousBid && previousBid.userId !== createBidDto.userId) {
            await this.notificationsService.notifyOutbid(
                previousBid.userId,
                previousBid.user.email,
                productName,
                amount,
                auctionId || eventProductId,
            );
        }

        // Broadcast the bid
        this.biddingGateway.broadcastBid({
            auctionId,
            eventProductId,
            bid: {
                ...bid,
                user: await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: { name: true, avatar: true },
                }),
            },
        });

        return bid;
    }

    async findByAuction(auctionId: string) {
        return this.prisma.bid.findMany({
            where: { auctionId },
            include: {
                user: {
                    select: { name: true, avatar: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByEventProduct(eventProductId: string) {
        return this.prisma.bid.findMany({
            where: { eventProductId },
            include: {
                user: {
                    select: { name: true, avatar: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByUser(userId: string) {
        return this.prisma.bid.findMany({
            where: { userId },
            include: {
                auction: { include: { product: true } },
                eventProduct: { include: { product: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
