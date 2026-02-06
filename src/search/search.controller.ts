import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get()
    search(
        @Query('q') q: string,
        @Query('type') type?: string,
        @Query('categoryId') categoryId?: string,
        @Query('priceMin') priceMin?: string,
        @Query('priceMax') priceMax?: string,
        @Query('status') status?: string,
    ) {
        return this.searchService.search(
            q || '',
            type,
            categoryId,
            priceMin ? parseFloat(priceMin) : undefined,
            priceMax ? parseFloat(priceMax) : undefined,
            status,
        );
    }
}
