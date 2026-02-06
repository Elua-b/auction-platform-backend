import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}
