import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    comment?: string;

    @IsString()
    @IsNotEmpty()
    sellerId: string;

    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    auctionId: string;
}
