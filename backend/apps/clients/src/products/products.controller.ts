import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import PaginationDto from './dto/Pagination.dto';
import { get } from 'http';

@Controller('products')
export class ProductsController {

    constructor(private readonly productsService: ProductsService) {}

    @Get()
    async findAll(
        @Query("page") paginationDto: PaginationDto
    ) {
        return this.productsService.findAll(paginationDto);
    }

    @Get(":id")
    async findOne(@Param("id") id: string) {
        try {
            return this.productsService.findOne(id);
        } catch (error) {
            return {
                statusCode: 404,
                message: error || "Product not found",
                error: "Not Found"
            };
        }
    }
}
