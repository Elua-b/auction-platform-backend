import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDto } from '../../dtos/create-category.dto';
import { CategoryEntity } from '../../domains/entities/category.entity';

@Injectable()
export class CreateCategoryUseCase {
    constructor(private readonly categoryRepository: CategoryRepository) { }

    async execute(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
        const category = new CategoryEntity();
        category.name = createCategoryDto.name;
        category.description = createCategoryDto.description;

        return await this.categoryRepository.create(category);
    }
}
