import { Injectable } from '@nestjs/common';
import { CategoryEntity } from '../../domains/entities/category.entity';
import { PrismaService } from '@/infra/config/prisma/prisma.service';
import { CategoryRepositoryInterface } from '../../domains/repositories/category.repository.interface';

@Injectable()
export class CategoryRepository implements CategoryRepositoryInterface {
    constructor(private prisma: PrismaService) { }

    async create(category: CategoryEntity): Promise<CategoryEntity> {
        const created = await this.prisma.category.create({
            data: {
                name: category.name,
                description: category.description,
            },
        });
        return created as unknown as CategoryEntity;
    }

    async findAll(): Promise<CategoryEntity[]> {
        const categories = await this.prisma.category.findMany();
        return categories as unknown as CategoryEntity[];
    }

    async findById(id: string): Promise<CategoryEntity | null> {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        return category as unknown as CategoryEntity | null;
    }

    async update(id: string, category: Partial<CategoryEntity>): Promise<CategoryEntity> {
        const updated = await this.prisma.category.update({
            where: { id },
            data: category,
        });
        return updated as unknown as CategoryEntity;
    }

    async delete(id: string): Promise<void> {
        await this.prisma.category.delete({
            where: { id },
        });
    }
}
