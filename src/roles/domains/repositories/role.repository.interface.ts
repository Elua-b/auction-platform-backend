import { RoleEntity } from '../entities/role.entity';

export interface RoleRepositoryInterface {
    create(role: RoleEntity): Promise<void>;
    findAll(): Promise<RoleEntity[]>;
}
