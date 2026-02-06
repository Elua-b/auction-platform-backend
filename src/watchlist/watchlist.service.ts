import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/config/prisma/prisma.service';

@Injectable()
export class WatchlistService {
    constructor(private prisma: PrismaService) { }

    async toggle(userId: string, productId: string) {
        const existing = await this.prisma.watchlist.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        if (existing) {
            return this.prisma.watchlist.delete({
                where: {
                    id: existing.id,
                },
            });
        }

        return this.prisma.watchlist.create({
            data: {
                userId,
                productId,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.watchlist.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        category: true,
                        seller: {
                            select: { name: true, avatar: true },
                        },
                    },
                },
            },
        });
    }

    async remove(userId: string, productId: string) {
        return this.prisma.watchlist.delete({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
    }
}
