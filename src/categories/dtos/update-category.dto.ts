import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateCategoryDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    @IsIn(['expense', 'income'])
    type?: string;

    @IsOptional()
    @IsString()
    description?: string;
}
