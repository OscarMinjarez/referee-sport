
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import Product from '@app/entities/classes/product.entity';
import Size from '@app/entities/classes/size.entity';
import Variant from '@app/entities/classes/variant.entity';
import Tag from '@app/entities/classes/tag.entity';
import { CloudinaryModule } from "@app/cloudinary/cloudinary.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Size, Variant, Tag]),
    CloudinaryModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule {}