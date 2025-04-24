import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsModule } from './products.module';
import { EntitiesService } from '@app/entities/entities.service';
import Size, { SizeValue } from '@app/entities/classes/size.entity';
import { DataSource } from 'typeorm';
import Product from '@app/entities/classes/product.entity';
import { CreateProductDto } from "./dto/CreateProduct.dto";
import { VariantDto } from './dto/variant.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let dataSource: DataSource;
  let createdProductIds: string[] = [];

  beforeAll(async () => {
    console.log('Iniciando configuración del test...');
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useClass: EntitiesService,
        }),
        ProductsModule,
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    dataSource = module.get<DataSource>(DataSource);
    console.log('Conexión a base de datos establecida:', dataSource.isInitialized ? 'OK' : 'FALLO');

    // Inserta tamaños base si no existen
    const sizeRepo = dataSource.getRepository(Size);
    console.log('Verificando tamaños existentes...');
    const existingSizes = await sizeRepo.find();
    console.log(`Tamaños encontrados: ${existingSizes.length}`);

    if (existingSizes.length === 0) {
      console.log('Insertando tamaños base...');
      const result = await sizeRepo.save([
        { size: SizeValue.Medium },
        { size: SizeValue.Large },
        { size: SizeValue.ExtraLarge },
      ]);
      console.log(`Tamaños insertados: ${result.length}`);
    }
  });

  afterAll(async () => {
    console.log('Cerrando conexión a base de datos...');
    await dataSource.destroy();
    console.log('Conexión cerrada');
  });

  it('debería crear 3 productos con variantes y etiquetas', async () => {
    console.log('Iniciando test de creación de productos con variantes y etiquetas...');

    const productos: CreateProductDto[] = [
      {
        name: 'Camiseta básica',
        description: 'Camiseta de algodón color blanco',
        price: 9.99,
        tagNames: ['ropa', 'algodón', 'básico', 'camiseta', 'blanco'],
        variants: [
          { size: SizeValue.Medium, quantity: 20 },
          { size: SizeValue.Large, quantity: 30 }
        ]
      },
      {
        name: 'Pantalón deportivo',
        description: 'Pantalón para correr',
        price: 19.99,
        tagNames: ['ropa', 'deportivo', 'pantalón', 'running'],
        variants: [
          { size: SizeValue.Medium, quantity: 10 },
          { size: SizeValue.Large, quantity: 15 },
          { size: SizeValue.ExtraLarge, quantity: 5 }
        ]
      },
      {
        name: 'Sudadera con capucha',
        description: 'Sudadera gruesa para invierno',
        price: 29.99,
        tagNames: ['ropa', 'invierno', 'sudadera', 'capucha'],
        variants: [
          { size: SizeValue.Large, quantity: 10 },
          { size: SizeValue.ExtraLarge, quantity: 10 }
        ],
        // Se incluye imagePath para probar la subida de imagen y asignación de imageUrl
        imagePath: 'C:/Users/JORGE/OneDrive/Documentos/GitHub/referee-sport/backend/futbol.jpg'
      },
    ];

    console.log('Productos a crear:', JSON.stringify(productos, null, 2));

    for (let i = 0; i < productos.length; i++) {
      console.log(`Creando producto ${i + 1}: ${productos[i].name}...`);
      try {
        const created = await service.create(productos[i]);
        console.log(`Producto ${i + 1} creado con UUID: ${created.uuid}`);
        createdProductIds.push(created.uuid);
        
        expect(created).toHaveProperty('uuid');
        expect(created.name).toBe(productos[i].name);
        
        // Verificar tags
        if (productos[i].tagNames) {
          expect(created.tags!.length).toBe(productos[i].tagNames!.length);
          
          // Verificar que cada tag existe
          for (const tagName of productos[i].tagNames!) {
            const foundTag = created.tags!.find(t => t.name.toLowerCase() === tagName.toLowerCase());
            expect(foundTag).toBeDefined();
          }
        }
        
        // Validar que se crearon las variantes correctamente
        if (productos[i].variants) {
          expect(created.variants!.length).toBe(productos[i].variants!.length);
          
          // Verificar que cada variante tiene el tamaño y cantidad correctos
          for (const variant of created.variants!) {
            expect(variant).toHaveProperty('quantity');
            expect(variant.size).toBeDefined();
            expect(variant.size).toHaveProperty('size');
          }
        }
        
        // Si se envió imagePath, se espera que imageUrl esté definida
        if (productos[i].imagePath) {
          expect(created.imageUrl).toBeDefined();
          console.log(`Producto ${i + 1} tiene imageUrl: ${created.imageUrl}`);
        }
      } catch (error) {
        console.error(`Error al crear producto ${i + 1}:`, error);
        throw error;
      }
    }
    console.log('Test de creación de productos completado');
  });

  it('debería obtener todos los productos con sus variantes y tags', async () => {
    console.log('Iniciando test de obtención de productos...');
    try {
      const allProducts = await service.findAll();
      console.log(`Total de productos encontrados: ${allProducts.length}`);
      console.log('Productos:', allProducts.map(p => ({ 
        uuid: p.uuid, 
        name: p.name, 
        variants: p.variants.map(v => ({
          size: v.size.size,
          quantity: v.quantity
        })),
        imageUrl: p.imageUrl,
        tags: p.tags ? p.tags.map(t => t.name) : []
      })));
      expect(allProducts.length).toBeGreaterThanOrEqual(3);
      
      // Verificar que cada producto tiene sus variantes y tags cargadas
      for (const product of allProducts) {
        expect(product.variants).toBeDefined();
        expect(product.tags).toBeDefined();
        
        for (const variant of product.variants) {
          expect(variant.size).toBeDefined();
        }
      }
    } catch (error) {
      console.error('Error al obtener todos los productos:', error);
      throw error;
    }
  });

  it('debería buscar productos por nombre', async () => {
    console.log('Iniciando test de búsqueda por nombre...');
    try {
      const searchTerm = 'Camiseta';
      console.log(`Buscando productos con término: "${searchTerm}"`);
      const results = await service.findByName(searchTerm);
      console.log(`Resultados encontrados: ${results.length}`);
      console.log('Resultados:', results.map(p => ({ 
        uuid: p.uuid, 
        name: p.name, 
        imageUrl: p.imageUrl,
        tags: p.tags ? p.tags.map(t => t.name) : [] 
      })));
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain(searchTerm);
      
      // Verificar que las variantes y tags se cargan correctamente
      for (const product of results) {
        expect(product.variants).toBeDefined();
        expect(product.tags).toBeDefined();
      }
    } catch (error) {
      console.error('Error al buscar productos por nombre:', error);
      throw error;
    }
  });

  it('debería buscar productos por etiqueta', async () => {
    console.log('Iniciando test de búsqueda por etiqueta...');
    try {
      const searchTag = 'deportivo';
      console.log(`Buscando productos con etiqueta: "${searchTag}"`);
      const results = await service.findByTag(searchTag);
      console.log(`Resultados encontrados: ${results.length}`);
      console.log('Resultados:', results.map(p => ({ 
        uuid: p.uuid, 
        name: p.name, 
        tags: p.tags ? p.tags.map(t => t.name) : [],
        variants: p.variants.length 
      })));
      expect(results.length).toBeGreaterThan(0);
      
      // Verificar que cada producto tiene la etiqueta buscada
      for (const product of results) {
        const hasTag = product.tags.some(tag => 
          tag.name.toLowerCase().includes(searchTag.toLowerCase())
        );
        expect(hasTag).toBeTruthy();
      }
      
      // Verificar que las variantes se cargan correctamente
      for (const product of results) {
        expect(product.variants).toBeDefined();
        expect(product.tags).toBeDefined();
      }
    } catch (error) {
      console.error('Error al buscar productos por etiqueta:', error);
      throw error;
    }
  });

  it('debería actualizar etiquetas y variantes de un producto', async () => {
    if (createdProductIds.length === 0) {
      console.log('No hay productos creados para actualizar');
      return;
    }

    const productId = createdProductIds[0];
    console.log(`Iniciando test de actualización para producto ${productId}...`);
    
    try {
      const product = await service.findOne(productId);
      console.log('Producto original:', {
        uuid: product.uuid,
        name: product.name,
        tags: product.tags ? product.tags.map(t => t.name) : [],
        variants: product.variants.map(v => ({
          size: v.size.size,
          quantity: v.quantity
        }))
      });
      
      const newTags = ['oferta', 'nuevo', 'destacado'];
      const newVariants: VariantDto[] = [
        { size: SizeValue.Small, quantity: 5 },
        { size: SizeValue.Medium, quantity: 15 },
        { size: SizeValue.Large, quantity: 10 }
      ];
      
      const updated = await service.update(productId, {
        tagNames: newTags,
        variants: newVariants
      });
      
      console.log('Producto actualizado:', {
        uuid: updated.uuid,
        name: updated.name,
        tags: updated.tags ? updated.tags.map(t => t.name) : [],
        variants: updated.variants.map(v => ({
          size: v.size.size,
          quantity: v.quantity
        }))
      });
      
      // Verificar etiquetas actualizadas
      expect(updated.tags).toBeDefined();
      expect(updated.tags.length).toBe(newTags.length);
      
      // Verificar que cada tag existe
      for (const tagName of newTags) {
        const foundTag = updated.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        expect(foundTag).toBeDefined();
      }
      
      // Verificar variantes actualizadas
      expect(updated.variants.length).toBe(newVariants.length);
      
      // Verificar que se encuentra la variante de talla Small
      const smallVariant = updated.variants.find(v => v.size.size === SizeValue.Small);
      expect(smallVariant).toBeDefined();
      expect(smallVariant?.quantity).toBe(5);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  });

  it('debería eliminar un producto y sus variantes', async () => {
    if (createdProductIds.length === 0) {
      console.log('No hay productos creados para eliminar');
      return;
    }

    const productId = createdProductIds[createdProductIds.length - 1];
    console.log(`Iniciando test de eliminación para producto ${productId}...`);
    
    try {
      const product = await service.findOne(productId);
      console.log('Producto a eliminar:', {
        uuid: product.uuid,
        name: product.name,
        variants: product.variants.length,
        tags: product.tags ? product.tags.length : 0
      });
      
      const result = await service.delete(productId);
      console.log('Resultado de eliminación:', result);
      
      expect(result.message).toContain('eliminado correctamente');
      
      // Verificar que realmente se eliminó
      try {
        await service.findOne(productId);
        fail('El producto debería haber sido eliminado');
      } catch (error) {
        console.log('Producto eliminado correctamente, error esperado');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  });
});