import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Product from "@app/entities/classes/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import Size from "@app/entities/classes/size.entity";
import Variant from "@app/entities/classes/variant.entity";
import Tag from "@app/entities/classes/tag.entity";
import { CloudinaryService } from "@app/cloudinary/cloudinary.service";
import { CreateProductDto } from "./dto/CreateProduct.dto";
import { UpdateProductDto } from './dto/UpdateProduct.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
      
        @InjectRepository(Size)
        private sizeRepository: Repository<Size>,
        
        @InjectRepository(Variant)
        private variantRepository: Repository<Variant>,
        
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>,
        
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    async findAll(): Promise<Product[]> {
        return await this.productRepository.find({
            relations: ['variants', 'variants.size', 'tags'],
        });
    }
    
    async findAllTags(): Promise<Tag[]> {
        return await this.tagRepository.find();
      }

    async findOne(id: string): Promise<Product> {
        try {
            const product = await this.productRepository.findOne({
                where: { uuid: id },
                relations: ['variants', 'variants.size', 'tags'],
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
        return await this.productRepository.find({
            where: { name: ILike(`%${name}%`) },
            relations: ['variants', 'variants.size', 'tags'],
        });
    }

    async findByTag(tagName: string): Promise<Product[]> {
        try {
            const products = await this.productRepository
                .createQueryBuilder('product')
                .leftJoinAndSelect('product.variants', 'variant')
                .leftJoinAndSelect('variant.size', 'size')
                .leftJoinAndSelect('product.tags', 'tag')
                .where('LOWER(tag.name) LIKE LOWER(:tagName)', { tagName: `%${tagName}%` })
                .getMany();

            if (!products || products.length === 0) {
                throw new HttpException('No se encontraron productos con esa etiqueta', HttpStatus.NOT_FOUND);
            }
            return products;
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

    private async getOrCreateTags(tagNames: string[]): Promise<Tag[]> {
        const tags: Tag[] = [];
        
        for (const name of tagNames) {
            let tag = await this.tagRepository.findOne({
                where: { name: ILike(name.trim()) }
            });
            
            if (!tag) {
                tag = this.tagRepository.create({ name: name.trim() });
                await this.tagRepository.save(tag);
            }
            
            tags.push(tag);
        }
        
        return tags;
    }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        try {
            const product = this.productRepository.create({
                name: createProductDto.name,
                description: createProductDto.description,
                price: createProductDto.price
            });

            // Manejar tags
            if (createProductDto.tagNames && createProductDto.tagNames.length > 0) {
                product.tags = await this.getOrCreateTags(createProductDto.tagNames);
            }

            if (createProductDto.imagePath) {
                const uploadResult = await this.cloudinaryService.uploadImage(
                    createProductDto.imagePath,
                    `product_${createProductDto.name.replace(/\s+/g, '_')}_${Date.now()}`
                );
                product.imageUrl = uploadResult.url;
            }

            // Guardar el producto primero para poder relacionar las variantes
            const savedProduct = await this.productRepository.save(product);

            // Crear variantes si existen
            if (createProductDto.variants && createProductDto.variants.length > 0) {
                const variants = [];
                
                for (const variantDto of createProductDto.variants) {
                    // Encontrar o crear el tamaño
                    let sizeEntity = await this.sizeRepository.findOne({
                        where: { size: variantDto.size }
                    });

                    if (!sizeEntity) {
                        sizeEntity = this.sizeRepository.create({ size: variantDto.size });
                        await this.sizeRepository.save(sizeEntity);
                    }

                    // Crear la variante
                    const variant = this.variantRepository.create({
                        quantity: variantDto.quantity,
                        size: sizeEntity,
                        product: savedProduct
                    });

                    variants.push(await this.variantRepository.save(variant));
                }

                // Asignar variantes al producto
                savedProduct.variants = variants;
                await this.productRepository.save(savedProduct);
            }

            // Retornar el producto completo con variantes
            return await this.findOne(savedProduct.uuid);
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
            const product = await this.findOne(id);

            // Actualizar propiedades básicas del producto
            if (updateProductDto.name) product.name = updateProductDto.name;
            if (updateProductDto.description) product.description = updateProductDto.description;
            if (updateProductDto.price) product.price = updateProductDto.price;
            
            // Actualizar tags si se proporcionan
            if (updateProductDto.tagNames) {
                product.tags = await this.getOrCreateTags(updateProductDto.tagNames);
            }

            // Manejar la imagen si se proporciona
            if (updateProductDto.imagePath) {
                const isUrl = /^https?:\/\//i.test(updateProductDto.imagePath);
                if (!isUrl) {
                    const publicId = `product_${product.name}_${Date.now()}`.replace(/\s+/g, '_');
                    const uploadResult = await this.cloudinaryService.uploadImage(
                        updateProductDto.imagePath,
                        publicId
                    );
                    product.imageUrl = uploadResult.url || uploadResult.publicId;
                } else {
                    product.imageUrl = updateProductDto.imagePath;
                }
            }

            // Actualizar el producto
            await this.productRepository.save(product);

            // Si se proporcionan variantes, actualizar las existentes
            if (updateProductDto.variants && updateProductDto.variants.length > 0) {
                // Eliminar variantes existentes
                if (product.variants && product.variants.length > 0) {
                    await this.variantRepository.remove(product.variants);
                }

                // Crear nuevas variantes
                const variants = [];
                
                for (const variantDto of updateProductDto.variants) {
                    // Encontrar o crear el tamaño
                    let sizeEntity = await this.sizeRepository.findOne({
                        where: { size: variantDto.size }
                    });

                    if (!sizeEntity) {
                        sizeEntity = this.sizeRepository.create({ size: variantDto.size });
                        await this.sizeRepository.save(sizeEntity);
                    }

                    // Crear la variante
                    const variant = this.variantRepository.create({
                        quantity: variantDto.quantity,
                        size: sizeEntity,
                        product: product
                    });

                    variants.push(await this.variantRepository.save(variant));
                }

                // Asignar variantes al producto
                product.variants = variants;
                await this.productRepository.save(product);
            }

            return await this.findOne(id);
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
        const product = await this.findOne(id);
        
        // Eliminar variantes asociadas
        if (product.variants && product.variants.length > 0) {
            await this.variantRepository.remove(product.variants);
        }
        
        await this.productRepository.delete(id);
        return { message: 'Producto eliminado correctamente' };
    }
}