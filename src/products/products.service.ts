import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/config/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(createProductDto: CreateProductDto, sellerId: string) {
        return this.prisma.product.create({
            data: {
                ...createProductDto,
                sellerId, // Override sellerId from DTO
                currentPrice: createProductDto.startingPrice,
                status: 'AVAILABLE',
            },
        });
    }

    async findAll(filters: { categoryId?: string; status?: string; sellerId?: string; standalone?: boolean }) {
        return this.prisma.product.findMany({
            where: {
                ...(filters.categoryId && { categoryId: filters.categoryId }),
                ...(filters.status && { status: filters.status }),
                ...(filters.sellerId && { sellerId: filters.sellerId }),
                ...(filters.standalone && { eventProducts: { none: {} } }),
            },
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                seller: true,
                auction: true,
                eventProducts: {
                    include: {
                        event: true
                    }
                }
            },
        });
    }

    private async checkOwnership(productId: string, user: any) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { sellerId: true }
        });

        if (!product) throw new NotFoundException('Product not found');

        if (user.role !== 'ADMIN' && product.sellerId !== user.id) {
            throw new ForbiddenException('You do not have permission to manage this product');
        }
    }

    async update(id: string, data: any, user: any) {
        await this.checkOwnership(id, user);
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, user: any) {
        await this.checkOwnership(id, user);
        // First check if product exists and get related data
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                auction: {
                    include: {
                        bids: true,
                    },
                },
                eventProducts: {
                    include: {
                        bids: true,
                    },
                },
                order: true,
            },
        });

        if (!product) {
            throw new Error('Product not found');
        }

        // Check if product has been sold
        if (product.status === 'SOLD' || product.order) {
            throw new Error('Cannot delete a sold product');
        }

        // Check if auction has bids
        if (product.auction?.bids?.length > 0) {
            throw new Error('Cannot delete product with existing bids');
        }

        // Check if event products have bids
        const hasEventBids = product.eventProducts.some(ep => ep.bids.length > 0);
        if (hasEventBids) {
            throw new Error('Cannot delete product with existing bids in events');
        }

        // Use transaction to delete related records first
        return this.prisma.$transaction(async (tx) => {
            // Delete auction if exists
            if (product.auction) {
                await tx.auction.delete({
                    where: { id: product.auction.id },
                });
            }

            // Delete event products if any
            if (product.eventProducts.length > 0) {
                await tx.eventProduct.deleteMany({
                    where: { productId: id },
                });
            }

            // Delete watchlist entries
            await tx.watchlist.deleteMany({
                where: { productId: id },
            });

            // Finally delete the product
            return tx.product.delete({
                where: { id },
            });
        });
    }
}
