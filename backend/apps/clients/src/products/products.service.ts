import Product from '@app/entities/classes/product.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PaginationDto from './dto/Pagination.dto';

@Injectable()
export class ProductsService {

    constructor(
        @InjectRepository(Product) private readonly productRepository: Repository<Product>
    ) {}

    async findAll(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const [ items, total ] = await this.productRepository.findAndCount({
            skip,
            take: limit,
            relations: {
                tags: true,
                productsVariants: {
                    variant: true
                }
            },
        });
        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                lastPage: Math.ceil(total / limit)
            }
        };
    }

    async findOne(id: string) {
        const product = await this.productRepository.findOne({
            where: { uuid: id },
            relations: {
                tags: true,
                productsVariants: {
                    variant: true
                }
            }
        });
        if (!product) {
            throw new Error(`Product with id ${id} not found`);
        }
        return product;
    }
}
