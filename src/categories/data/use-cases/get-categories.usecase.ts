import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryEntity } from '../../domains/entities/category.entity';

@Injectable()
export class GetCategoriesUseCase {
    constructor(private readonly categoryRepository: CategoryRepository) { }

    async execute(): Promise<CategoryEntity[]> {
        return await this.categoryRepository.findAll();
    }
}
