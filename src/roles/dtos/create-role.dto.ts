import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateRoleDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    @IsString({ each: true })
    permissions: string[];
}
