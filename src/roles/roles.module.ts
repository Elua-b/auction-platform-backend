import { Module } from '@nestjs/common';
import { PrismaModule } from '@/infra/config/prisma/prisma.module';
import { RolesController } from './application/controllers/roles.controller';
import { RoleRepository } from './data/repositories/role.repository';
import { CreateRoleUseCase } from './data/use-cases/create-role.usecase';
import { GetRolesUseCase } from './data/use-cases/get-roles.usecase';

@Module({
    imports: [PrismaModule],
    controllers: [RolesController],
    providers: [
        RoleRepository,
        CreateRoleUseCase,
        GetRolesUseCase,
    ],
})
export class RolesModule { }
