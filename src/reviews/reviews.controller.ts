import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
        return this.reviewsService.create(createReviewDto, req.user.id);
    }

    @Get('seller/:sellerId')
    findBySeller(@Param('sellerId') sellerId: string) {
        return this.reviewsService.findBySeller(sellerId);
    }

    @Get('product/:productId')
    findByProduct(@Param('productId') productId: string) {
        return this.reviewsService.findByProduct(productId);
    }
}
