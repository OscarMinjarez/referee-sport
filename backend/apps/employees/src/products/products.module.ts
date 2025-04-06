import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import Product from '@app/entities/classes/product.entity';
import Size from '@app/entities/classes/size.entity';
import { CloudinaryModule } from "@app/cloudinary/cloudinary.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Size]),
    CloudinaryModule, // Importa el módulo que provee CloudinaryService
  ],
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule {}