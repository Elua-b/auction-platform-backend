import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { UpdateCategoryDto } from '../../dtos/update-category.dto';
import { CategoryEntity } from '../../domains/entities/category.entity';

@Injectable()
export class UpdateCategoryUseCase {
    constructor(private readonly categoryRepository: CategoryRepository) { }

    async execute(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryEntity> {
        return await this.categoryRepository.update(id, updateCategoryDto);
    }
}
