import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryEntity } from '../../domains/entities/category.entity';

@Injectable()
export class GetCategoryUseCase {
    constructor(private readonly categoryRepository: CategoryRepository) { }

    async execute(id: string): Promise<CategoryEntity | null> {
        return await this.categoryRepository.findById(id);
    }
}
