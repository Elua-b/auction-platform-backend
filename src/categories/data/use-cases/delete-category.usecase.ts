import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';

@Injectable()
export class DeleteCategoryUseCase {
    constructor(private readonly categoryRepository: CategoryRepository) { }

    async execute(id: string): Promise<void> {
        await this.categoryRepository.delete(id);
    }
}
