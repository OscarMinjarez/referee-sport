
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param, ValidationPipe
} from '@nestjs/common';
import Product from '@app/entities/classes/product.entity';
import { ProductsService } from "./products.service";
import {CreateProductDto} from "./dto/CreateProduct.dto";
import { UpdateProductDto } from './dto/UpdateProduct.dto';
import Tag from '@app/entities/classes/tag.entity';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  async findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    try {
      return this.productsService.findOne(id);
    } catch (error: any) {
      throw error;
    }
  }
  
  @Get('tags')
  async findAllTags(): Promise<Tag[]> {
    return this.productsService.findAllTags();
  }

  @Get('search/:name')
  async findByName(@Param('name') name: string): Promise<Product[]> {
    try {
      return this.productsService.findByName(name);
    } catch (error: any) {
      throw error;
    }
  }

  @Get('tag/:tag')
  async findByTag(@Param('tag') tag: string): Promise<Product[]> {
    try {
      return this.productsService.findByTag(tag);
    } catch (error: any) {
      throw error;
    }
  }

 

  @Post()
  async create(@Body(new ValidationPipe()) createProductDto: CreateProductDto): Promise<Product> {
    try {
     return this.productsService.create(createProductDto);
    } catch (error: any) {
      throw error;
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateProductDto: UpdateProductDto
  ): Promise<Product> {
    try {
      return this.productsService.update(id, updateProductDto);
    } catch (error: any) {
      throw error;
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    try {
      return await this.productsService.delete(id);
    } catch (error) {
      throw error;
    }
  }
}