import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param
  } from '@nestjs/common';
  import Product from '@app/entities/classes/product.entity';
import {ProductsService} from "./products.service";
  
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

  @Get('search/:name')
  async findByName(@Param('name') name: string): Promise<Product[]> {
    try {
      return this.productsService.findByName(name);
    } catch (error: any) {
      throw error;
    }
  }

  @Post()
  async create(@Body() productData: Partial<Product>): Promise<Product> {
    try {
     return this.productsService.create(productData);
    } catch (error: any) {
      throw error;
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() productData: Partial<Product>
  ): Promise<Product> {
    try {
      return this.productsService.update(id, productData);
    } catch (error: any) {
      throw error;
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    try {
      return this.productsService.delete(id);
    } catch (error: any) {
      throw error;
    }
  }
}