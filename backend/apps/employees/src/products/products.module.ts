
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import Product from '@app/entities/classes/product.entity';
import Variant from '@app/entities/classes/variant.entity';
import Tag from '@app/entities/classes/tag.entity';
import { CloudinaryModule } from "@app/cloudinary/cloudinary.module";
import ProductVariant from '@app/entities/classes/productVariant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Variant, Tag, ProductVariant]),
    CloudinaryModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule {}