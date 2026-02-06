import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';
import { IRole } from '../interfaces/role.interface';

export class RoleEntity implements IRole {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    permissions: string[];
}
