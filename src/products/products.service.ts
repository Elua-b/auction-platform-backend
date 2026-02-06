import { Injectable } from '@nestjs/common';
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

    async findAll(filters: { categoryId?: string; status?: string; sellerId?: string }) {
        return this.prisma.product.findMany({
            where: {
                ...(filters.categoryId && { categoryId: filters.categoryId }),
                ...(filters.status && { status: filters.status }),
                ...(filters.sellerId && { sellerId: filters.sellerId }),
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
            },
        });
    }

    async update(id: string, data: any) {
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.product.delete({
            where: { id },
        });
    }
}
