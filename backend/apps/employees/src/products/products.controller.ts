import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param, 
    HttpStatus, 
    HttpException 
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, ILike } from 'typeorm';
  import Product from '@app/entities/classes/product.entity';
  import Size from '@app/entities/classes/size.entity';
  
  @Controller('products')
  export class ProductsController {
    constructor(
      @InjectRepository(Product)
      private productRepository: Repository<Product>,
      @InjectRepository(Size)
      private sizeRepository: Repository<Size>,
    ) {}
  
    @Get()
    async findAll(): Promise<Product[]> {
      try {
        return await this.productRepository.find({
          relations: ['size'],
        });
      } catch (error: any) {
        throw new HttpException(
          'Error al obtener los productos',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Product> {
      try {
        const product = await this.productRepository.findOne({
          where: { uuid: id },
          relations: ['size'],
        });
        
        if (!product) {
          throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
        }
        
        return product;
      } catch (error: any) {
        if (error?.status === HttpStatus.NOT_FOUND) {
          throw error;
        }
        throw new HttpException(
          'Error al obtener el producto',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  
    // Nuevo endpoint para buscar productos por nombre
    @Get('search/:name')
    async findByName(@Param('name') name: string): Promise<Product[]> {
      try {
        const products = await this.productRepository.find({
          where: { name: ILike(`%${name}%`) },
          relations: ['size'],
        });
        
        if (!products || products.length === 0) {
          throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
        }
        
        return products;
      } catch (error: any) {
        if (error?.status === HttpStatus.NOT_FOUND) {
          throw error;
        }
        throw new HttpException(
          'Error al buscar el producto',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  
    @Post()
    async create(@Body() productData: Partial<Product>): Promise<Product> {
      try {
        const { size, ...productDetails } = productData;
        
        const product = this.productRepository.create(productDetails);
        
        if (size) {
          let sizeEntity = await this.sizeRepository.findOne({
            where: { size: size['size'] }
          });
          
          if (!sizeEntity) {
            sizeEntity = this.sizeRepository.create(size);
            await this.sizeRepository.save(sizeEntity);
          }
          
          product.size = sizeEntity;
        }
        
        return this.productRepository.save(product);
      } catch (error: any) {
        throw new HttpException(
          'Error al crear el producto',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  
    @Put(':id')
    async update(
      @Param('id') id: string,
      @Body() productData: Partial<Product>
    ): Promise<Product> {
      try {
        const { size, ...productDetails } = productData;
        
        await this.productRepository.update({ uuid: id }, productDetails);
        
        const product = await this.productRepository.findOne({
          where: { uuid: id },
          relations: ['size'],
        });
        
        if (!product) {
          throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
        }
        
        if (size) {
          let sizeEntity = await this.sizeRepository.findOne({
            where: { size: size['size'] }
          });
          
          if (!sizeEntity) {
            sizeEntity = this.sizeRepository.create(size);
            await this.sizeRepository.save(sizeEntity);
          }
          
          product.size = sizeEntity;
          await this.productRepository.save(product);
        }
        
        return product;
      } catch (error: any) {
        if (error?.status === HttpStatus.NOT_FOUND) {
          throw error;
        }
        throw new HttpException(
          'Error al actualizar el producto',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
      try {
        const product = await this.productRepository.findOne({
          where: { uuid: id }
        });
        
        if (!product) {
          throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
        }
        
        await this.productRepository.delete({ uuid: id });
        return { message: 'Producto eliminado correctamente' };
      } catch (error: any) {
        if (error?.status === HttpStatus.NOT_FOUND) {
          throw error;
        }
        throw new HttpException(
          'Error al eliminar el producto',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }