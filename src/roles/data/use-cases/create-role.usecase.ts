import { Injectable } from '@nestjs/common';
import { RoleEntity } from '../../domains/entities/role.entity';
import { RoleRepository } from '../repositories/role.repository';
import { CreateRoleDto } from '../../dtos/create-role.dto';

@Injectable()
export class CreateRoleUseCase {
    constructor(private readonly roleRepository: RoleRepository) { }

    async execute(dto: CreateRoleDto): Promise<void> {
        const role = new RoleEntity();
        role.name = dto.name;
        role.description = dto.description;
        role.permissions = dto.permissions;

        await this.roleRepository.create(role);
    }
}
