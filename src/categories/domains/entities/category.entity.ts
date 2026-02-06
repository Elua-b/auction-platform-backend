import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ICategory } from '../interfaces/category.interface';

export class CategoryEntity implements ICategory {
    @IsOptional()
    id?: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}
