import { Injectable } from '@nestjs/common';
import { RoleEntity } from '../../domains/entities/role.entity';
import { PrismaService } from '@/infra/config/prisma/prisma.service';
import { RoleRepositoryInterface } from '../../domains/repositories/role.repository.interface';

@Injectable()
export class RoleRepository implements RoleRepositoryInterface {
    constructor(private prisma: PrismaService) { }

    async create(role: RoleEntity): Promise<void> {
        await this.prisma.role.create({
            data: {
                name: role.name,
                description: role.description,
                permissions: role.permissions,
            },
        });
    }

    async findAll(): Promise<RoleEntity[]> {
        const roles = await this.prisma.role.findMany();
        return roles as RoleEntity[];
    }
}
