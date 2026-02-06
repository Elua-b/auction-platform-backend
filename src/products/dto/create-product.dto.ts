export class CreateProductDto {
    title: string;
    description: string;
    image?: string;
    startingPrice: number;
    categoryId: string;
    sellerId: string;
}
