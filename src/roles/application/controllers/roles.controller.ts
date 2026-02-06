import { Controller, Post, Get, Body } from '@nestjs/common';
import { CreateRoleUseCase } from '../../data/use-cases/create-role.usecase';
import { GetRolesUseCase } from '../../data/use-cases/get-roles.usecase';
import { CreateRoleDto } from '../../dtos/create-role.dto';
import { RoleEntity } from '../../domains/entities/role.entity';

@Controller('roles')
export class RolesController {
    constructor(
        private readonly createRoleUseCase: CreateRoleUseCase,
        private readonly getRolesUseCase: GetRolesUseCase
    ) { }

    @Post()
    async create(@Body() createRoleDto: CreateRoleDto): Promise<void> {
        await this.createRoleUseCase.execute(createRoleDto);
    }

    @Get()
    async findAll(): Promise<RoleEntity[]> {
        return await this.getRolesUseCase.execute();
    }
}
