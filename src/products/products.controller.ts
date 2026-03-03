import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    create(@Body() createProductDto: CreateProductDto, @Request() req) {
        return this.productsService.create(createProductDto, req.user.id);
    }

    @Get()
    findAll(
        @Query('categoryId') categoryId?: string,
        @Query('status') status?: string,
        @Query('sellerId') sellerId?: string,
        @Query('standalone') standalone?: string,
    ) {
        return this.productsService.findAll({
            categoryId,
            status,
            sellerId,
            standalone: standalone === 'true'
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    update(@Param('id') id: string, @Body() updateProductDto: any, @Request() req) {
        return this.productsService.update(id, updateProductDto, req.user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SELLER', 'ADMIN')
    remove(@Param('id') id: string, @Request() req) {
        return this.productsService.remove(id, req.user);
    }
}
