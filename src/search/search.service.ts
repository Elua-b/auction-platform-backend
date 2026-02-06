import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/config/prisma/prisma.service';

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) { }

    async search(query: string, type?: string, categoryId?: string, priceMin?: number, priceMax?: number, status?: string) {
        const results: any = {};

        if (!type || type === 'products') {
            results.products = await this.prisma.product.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                    ],
                    ...(categoryId && { categoryId }),
                    ...(status && { status }),
                    ...(priceMin !== undefined || priceMax !== undefined) && {
                        currentPrice: {
                            ...(priceMin !== undefined && { gte: priceMin }),
                            ...(priceMax !== undefined && { lte: priceMax }),
                        },
                    },
                },
                include: { category: true, seller: { select: { name: true, avatar: true } } },
            });
        }

        if (!type || type === 'auctions') {
            results.auctions = await this.prisma.auction.findMany({
                where: {
                    product: {
                        OR: [
                            { title: { contains: query, mode: 'insensitive' } },
                            { description: { contains: query, mode: 'insensitive' } },
                        ],
                        ...(categoryId && { categoryId }),
                    },
                    ...(status && { status }),
                },
                include: { product: { include: { category: true } } },
            });
        }

        if (!type || type === 'events') {
            results.events = await this.prisma.event.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                    ],
                    ...(status && { status }),
                },
            });
        }

        return {
            results,
            query,
            timestamp: new Date(),
        };
    }
}
