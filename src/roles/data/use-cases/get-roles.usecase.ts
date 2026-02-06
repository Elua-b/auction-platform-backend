import { Inject, Injectable } from '@nestjs/common';
import { RoleRepositoryInterface } from '../../domains/repositories/role.repository.interface';
import { RoleEntity } from '../../domains/entities/role.entity';
import { RoleRepository } from '../repositories/role.repository';

@Injectable()
export class GetRolesUseCase {
    constructor(
        @Inject(RoleRepository)
        private readonly roleRepository: RoleRepositoryInterface,
    ) { }

    async execute(): Promise<RoleEntity[]> {
        return await this.roleRepository.findAll();
    }
}
