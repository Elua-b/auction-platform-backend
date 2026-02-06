import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/config/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async create(createReviewDto: CreateReviewDto, buyerId: string) {
        // Verify auction ended and this user is the winner
        const auction = await this.prisma.auction.findUnique({
            where: { id: createReviewDto.auctionId },
            include: {
                bids: {
                    orderBy: { amount: 'desc' },
                    take: 1,
                },
            },
        });

        if (!auction || auction.status !== 'ENDED') {
            throw new BadRequestException('Auction has not ended yet');
        }

        if (auction.bids[0]?.userId !== buyerId) {
            throw new BadRequestException('Only the auction winner can leave a review');
        }

        // Check if review already exists
        const existing = await this.prisma.review.findFirst({
            where: {
                buyerId,
                auctionId: createReviewDto.auctionId,
            },
        });

        if (existing) {
            throw new BadRequestException('You have already reviewed this auction');
        }

        return this.prisma.review.create({
            data: {
                ...createReviewDto,
                buyerId,
            },
        });
    }

    async findBySeller(sellerId: string) {
        return this.prisma.review.findMany({
            where: { sellerId },
            include: {
                buyer: { select: { name: true, avatar: true } },
                product: { select: { title: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByProduct(productId: string) {
        return this.prisma.review.findMany({
            where: { productId },
            include: {
                buyer: { select: { name: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
