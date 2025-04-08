import { Body, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import Product from "@app/entities/classes/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import Size from "@app/entities/classes/size.entity";
import { CloudinaryService } from "@app/cloudinary/cloudinary.service";
import {CreateProductDto} from "./dto/CreateProduct.dto"; // Ajusta la ruta según tu estructura
import { UpdateProductDto } from './dto/UpdateProduct.dto';

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

    async create(createProductDto: CreateProductDto): Promise<Product> {
        try {
            const product = this.productRepository.create({
                name: createProductDto.name,
                description: createProductDto.description,
                price: createProductDto.price,
                stockQuantity: createProductDto.stockQuantity,
                tags: createProductDto.tags || [],
            });
            if (createProductDto.imagePath) {
                const uploadResult = await this.cloudinaryService.uploadImage(
                    createProductDto.imagePath,
                    `product_${createProductDto.name.replace(/\s+/g, '_')}_${Date.now()}`
                );
                product.imageUrl = uploadResult.url;
            }
            if (createProductDto.size?.size) {
                let sizeEntity = await this.sizeRepository.findOne({
                    where: { size: createProductDto.size.size }
                });

                if (!sizeEntity) {
                    sizeEntity = this.sizeRepository.create({ size: createProductDto.size.size });
                    await this.sizeRepository.save(sizeEntity);
                }
                product.size = sizeEntity;
            }
            const savedProduct = await this.productRepository.save(product);
            return savedProduct;
        } catch (error) {
            console.error('Error al crear producto:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                error || 'Error al crear el producto',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async update(
        id: string,
        updateProductDto: UpdateProductDto
    ): Promise<Product> {
        try {
            const product = await this.productRepository.findOne({
                where: { uuid: id },
                relations: ['size'],
            });
            if (!product) {
                throw new NotFoundException(`Producto con ID ${id} no encontrado`);
            }
            if (updateProductDto.name) product.name = updateProductDto.name;
            if (updateProductDto.description) product.description = updateProductDto.description;
            if (updateProductDto.price) product.price = updateProductDto.price;
            if (updateProductDto.stockQuantity) product.stockQuantity = updateProductDto.stockQuantity;
            if (updateProductDto.tags) product.tags = updateProductDto.tags;
            if (updateProductDto.imagePath) {
                const publicId = `product_${product.name}_${Date.now()}`.replace(/\s+/g, '_');
                const uploadResult = await this.cloudinaryService.uploadImage(
                    updateProductDto.imagePath,
                    publicId
                );
                product.imageUrl = uploadResult.publicId;
            }
            if (updateProductDto.size?.size) {
                let sizeEntity = await this.sizeRepository.findOne({
                    where: { size: updateProductDto.size.size }
                });
                if (!sizeEntity) {
                    sizeEntity = this.sizeRepository.create({ size: updateProductDto.size.size });
                    await this.sizeRepository.save(sizeEntity);
                }
                product.size = sizeEntity;
            }
            const updatedProduct = await this.productRepository.save(product);
            return updatedProduct;
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                error || 'Error al actualizar el producto',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async delete(id: string): Promise<{ message: string }> {
        const product = await this.productRepository.findOne({ where: { uuid: id } });
        if (!product) {
            throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }
        await this.productRepository.delete(id);
        return { message: 'Producto eliminado correctamente' };
    }
}