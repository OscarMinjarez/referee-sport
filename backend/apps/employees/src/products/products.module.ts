import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import Product from '@app/entities/classes/product.entity';
import Size from '@app/entities/classes/size.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Size])],
  controllers: [ProductsController],
  exports: []
})
export class ProductsModule {}