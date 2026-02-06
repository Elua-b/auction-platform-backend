import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/config/prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.category.findMany();
    }

    async findOne(id: string) {
        return this.prisma.category.findUnique({
            where: { id },
        });
    }

    async create(data: { name: string; description?: string; image?: string }) {
        return this.prisma.category.create({
            data,
        });
    }

    async seed() {
        const categories = [
            'Watches & Accessories',
            'Jewelry',
            'Art & Collectibles',
            'Electronics',
            'Fashion & Clothing',
            'Books & Media',
            'Sports & Recreation',
            'Home & Garden',
            'Antiques',
            'Other',
        ];

        const results = [];
        for (const name of categories) {
            const exists = await this.prisma.category.findUnique({ where: { name } });
            if (!exists) {
                const category = await this.prisma.category.create({
                    data: { name, description: `All things ${name}` },
                });
                results.push(category);
            }
        }
        return { message: 'Seeding complete', created: results.length };
    }
}
