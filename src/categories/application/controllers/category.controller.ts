import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { CreateCategoryUseCase } from '../../data/use-cases/create-category.usecase';
import { GetCategoriesUseCase } from '../../data/use-cases/get-categories.usecase';
import { GetCategoryUseCase } from '../../data/use-cases/get-category.usecase';
import { UpdateCategoryUseCase } from '../../data/use-cases/update-category.usecase';
import { DeleteCategoryUseCase } from '../../data/use-cases/delete-category.usecase';
import { CreateCategoryDto } from '../../dtos/create-category.dto';
import { UpdateCategoryDto } from '../../dtos/update-category.dto';
import { CategoryEntity } from '../../domains/entities/category.entity';

@Controller('categories')
export class CategoryController {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
        private readonly getCategoriesUseCase: GetCategoriesUseCase,
        private readonly getCategoryUseCase: GetCategoryUseCase,
        private readonly updateCategoryUseCase: UpdateCategoryUseCase,
        private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    ) { }

    @Post()
    async create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
        return await this.createCategoryUseCase.execute(createCategoryDto);
    }

    @Get()
    async findAll(): Promise<CategoryEntity[]> {
        return await this.getCategoriesUseCase.execute();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<CategoryEntity | null> {
        return await this.getCategoryUseCase.execute(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<CategoryEntity> {
        return await this.updateCategoryUseCase.execute(id, updateCategoryDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        await this.deleteCategoryUseCase.execute(id);
    }
}
