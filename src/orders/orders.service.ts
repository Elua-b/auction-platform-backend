import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/config/prisma/prisma.service';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async createOrder(data: { userId: string, productId: string, amount: number }) {
        const product = await this.prisma.product.findUnique({
            where: { id: data.productId },
        });

        if (!product) {
            throw new Error('Product not found');
        }

        // Logic relies on Buy Now which might be distinct from Auction
        if (product.status === 'SOLD') {
            throw new Error('Product is already sold');
        }

        // Transaction to create order and mark product as sold (if it's a direct buy)
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    userId: data.userId,
                    productId: data.productId,
                    amount: data.amount,
                    paymentStatus: 'PENDING',
                    shippingStatus: 'NOT_SHIPPED',
                },
            });

            await tx.product.update({
                where: { id: data.productId },
                data: { status: 'SOLD' },
            });

            return order;
        });
    }

    async findByUser(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findBySeller(sellerId: string) {
        return this.prisma.order.findMany({
            where: {
                product: {
                    sellerId: sellerId,
                },
            },
            include: {
                product: {
                    include: {
                        category: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                product: {
                    include: {
                        category: true,
                        seller: { select: { name: true, email: true } },
                    },
                },
                user: { select: { name: true, email: true } },
            },
        });
    }
}
