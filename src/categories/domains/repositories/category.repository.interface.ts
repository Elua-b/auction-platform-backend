import { CategoryEntity } from '../entities/category.entity';

export interface CategoryRepositoryInterface {
    create(category: CategoryEntity): Promise<CategoryEntity>;
    findAll(): Promise<CategoryEntity[]>;
    findById(id: string): Promise<CategoryEntity | null>;
    update(id: string, category: Partial<CategoryEntity>): Promise<CategoryEntity>;
    delete(id: string): Promise<void>;
}
