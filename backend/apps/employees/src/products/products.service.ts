import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Product from "@app/entities/classes/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, ILike, IsNull, Repository } from "typeorm";
import Variant from "@app/entities/classes/variant.entity";
import Tag from "@app/entities/classes/tag.entity";
import { CloudinaryService } from "@app/cloudinary/cloudinary.service";
import { CreateProductDto } from "./dto/CreateProduct.dto";
import { UpdateProductDto } from './dto/UpdateProduct.dto';
import ProductVariant from '@app/entities/classes/productVariant.entity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        
        @InjectRepository(Variant)
        private variantRepository: Repository<Variant>,

        @InjectRepository(ProductVariant)
        private productVariantRepository: Repository<ProductVariant>,
        
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>,
        
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    async findAll(): Promise<Product[]> {
        return await this.productRepository.find({
            relations: {
                productsVariants: {
                    variant: true
                },
                tags: true
            },
        });
    }
    
    async findAllTags(): Promise<Tag[]> {
        return await this.tagRepository.find();
      }

    async findOne(id: string): Promise<Product> {
        try {
            const product = await this.productRepository.findOne({
                where: { uuid: id },
                relations: {
                    productsVariants: {
                        variant: true
                    },
                    tags: true
                },
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
            const savedProduct = await this.productRepository.save(product);
            if (createProductDto.variants && createProductDto.variants.length > 0) {
                for (const variantDto of createProductDto.variants) {
                    const { type, value, quantity } = variantDto;
                    const variantEntity = await this.getOrCreateVariant(type, value);
                    const productVariant = this.productVariantRepository.create({
                        product: savedProduct,
                        variant: variantEntity,
                        quantity,
                    });
                    await this.productVariantRepository.save(productVariant);
                }
            }
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

    private async getOrCreateVariant(type: string | null, value: string): Promise<Variant> {
        if (!value || typeof value !== 'string') {
            throw new Error('El valor de la variante debe ser un string no vacío');
        }
        const normalizedType = type?.trim().toUpperCase();
        const normalizedValue = value.trim().toUpperCase();
        const where: FindOptionsWhere<Variant> = { 
            value: ILike(normalizedValue) 
        };
        if (normalizedType !== null) {
            where.type = normalizedType;
        } else {
            where.type = IsNull();
        }
        const existingVariant = await this.variantRepository.findOne({ where });    
        if (existingVariant) {
            return existingVariant;
        }
        const newVariant = this.variantRepository.create({
            type: normalizedType,
            value: normalizedValue
        });
        return await this.variantRepository.save(newVariant);
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        try {
            const product = await this.findOne(id);
            if (updateProductDto.name) product.name = updateProductDto.name;
            if (updateProductDto.description) product.description = updateProductDto.description;
            if (updateProductDto.price) product.price = updateProductDto.price;
            if (updateProductDto.tagNames) {
                product.tags = await this.getOrCreateTags(updateProductDto.tagNames);
            }
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
            await this.productRepository.save(product);
            if (updateProductDto.variants && updateProductDto.variants?.length > 0) {
                const existingProductVariants = await this.productVariantRepository.find({
                    where: { product: { uuid: product.uuid } },
                    relations: ['variant']
                });
                if (existingProductVariants.length > 0) {
                    await this.productVariantRepository.remove(existingProductVariants);
                }
                for (const variantDto of updateProductDto.variants) {
                    const variantEntity = await this.getOrCreateVariant(
                        variantDto.type, 
                        variantDto.value
                    );
                    const productVariant = this.productVariantRepository.create({
                        product,
                        variant: variantEntity,
                        quantity: variantDto.quantity
                    });
                    await this.productVariantRepository.save(productVariant);
                }
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
        const productVariants = await this.productVariantRepository.find({
            where: { product: { uuid: id } },
        });
        if (productVariants.length > 0) {
            await this.productVariantRepository.remove(productVariants);
        }
        await this.productRepository.delete(id);
        return { message: 'Producto eliminado correctamente' };
    }
}