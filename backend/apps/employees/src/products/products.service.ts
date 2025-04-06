import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Product from "@app/entities/classes/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import Size from "@app/entities/classes/size.entity";
import { CloudinaryService } from "@app/cloudinary/cloudinary.service"; // Ajusta la ruta según tu estructura

@Injectable()
export class ProductsService {

    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
      
        @InjectRepository(Size)
        private sizeRepository: Repository<Size>,
        
        private readonly cloudinaryService: CloudinaryService, // Inyección del servicio Cloudinary
      ) {}

    async findAll(): Promise<Product[]> {
        return await this.productRepository.find({
            relations: ['size'],
        });
    }

    async findOne(id: string): Promise<Product> {
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

    async findByName(name: string): Promise<Product[]> {
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

    async findByTag(tag: string): Promise<Product[]> {
        try {
            const products = await this.productRepository.find({
                relations: ['size'],
            });

            // Filter products that have the specified tag
            const filteredProducts = products.filter(product => 
                product.tags && product.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
            );

            if (!filteredProducts || filteredProducts.length === 0) {
                throw new HttpException('No se encontraron productos con esa etiqueta', HttpStatus.NOT_FOUND);
            }
            
            return filteredProducts;
        } catch (error: any) {
            if (error?.status === HttpStatus.NOT_FOUND) {
                throw error;
            }
            throw new HttpException(
                'Error al buscar productos por etiqueta',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Se espera que productData pueda incluir una propiedad imagePath para subir la imagen
    async create(@Body() productData: Partial<Product> & { imagePath?: string }): Promise<Product> {
        try {
            const { size, imagePath, ...productDetails } = productData;
            const product = this.productRepository.create(productDetails);

            // Si se envía imagePath, se sube la imagen y se asigna la URL al producto
            if (imagePath) {
                const uploadResult = await this.cloudinaryService.uploadImage(imagePath, product.name);
                product.imageUrl = uploadResult?.url;
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
            }
            return this.productRepository.save(product);
        } catch (error: any) {
            throw new HttpException(
                'Error al crear el producto',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async update(
        id: string,
        productData: Partial<Product> & { imagePath?: string }
    ): Promise<Product> {
        try {
            const { size, imagePath, ...productDetails } = productData;
            await this.productRepository.update({ uuid: id }, productDetails);
            const product = await this.productRepository.findOne({
                where: { uuid: id },
                relations: ['size'],
            });
            if (!product) {
                throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
            }
            if (imagePath) {
                const uploadResult = await this.cloudinaryService.uploadImage(imagePath, productData.name || product.name);
                product.imageUrl = uploadResult?.url;
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

    async delete(id: string): Promise<{ message: string }> {
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