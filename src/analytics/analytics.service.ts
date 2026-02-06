import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/config/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getSellerAnalytics(sellerId: string) {
        // Get seller's products with auction and order data
        const products = await this.prisma.product.findMany({
            where: { sellerId },
            include: {
                auction: {
                    include: {
                        _count: { select: { bids: true } },
                    },
                },
                order: true,
            },
        });

        // Calculate statistics
        const totalProducts = products.length;
        const activeAuctions = products.filter(p =>
            p.auction && p.auction.status === 'ACTIVE'
        ).length;
        const soldItems = products.filter(p => p.status === 'SOLD').length;

        // Calculate total revenue from sold products
        const totalRevenue = products.reduce((sum, product) => {
            if (product.order) {
                return sum + product.order.amount;
            }
            return sum;
        }, 0);

        // Calculate total bids across all auctions
        const totalBids = products.reduce((sum, product) => {
            if (product.auction) {
                return sum + product.auction._count.bids;
            }
            return sum;
        }, 0);

        const avgSellingPrice = soldItems > 0 ? totalRevenue / soldItems : 0;

        return {
            totalProducts,
            activeAuctions,
            soldItems,
            totalSales: totalRevenue,
            totalRevenue, // Keep for compatibility
            totalBids,
            averagePrice: avgSellingPrice,
            avgSellingPrice, // Keep for compatibility
            monthlyGrowth: 12, // TODO: Calculate actual growth
            weeklyGrowth: 8,   // TODO: Calculate actual growth
        };
    }

    async getPlatformAnalytics() {
        // Get counts
        const [totalUsers, totalAuctions, totalProducts, totalOrders] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.auction.count(),
            this.prisma.product.count(),
            this.prisma.order.count(),
        ]);

        // Get active auctions
        const activeAuctions = await this.prisma.auction.count({
            where: { status: 'ACTIVE' },
        });

        // Calculate total revenue
        const orders = await this.prisma.order.findMany({
            select: { amount: true },
        });
        const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);

        // Get total attendees (unique users who placed bids)
        const uniqueBidders = await this.prisma.bid.findMany({
            distinct: ['userId'],
            select: { userId: true },
        });

        return {
            totalUsers,
            totalAuctions,
            activeAuctions,
            totalProducts,
            totalRevenue,
            totalSales: totalRevenue, // Consistent naming
            totalOrders,
            totalAttendees: uniqueBidders.length,
            monthlyGrowth: 12, // TODO: Calculate actual growth
        };
    }
}
