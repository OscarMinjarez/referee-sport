import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsModule } from './products.module';
import { EntitiesService } from '@app/entities/entities.service';
import Size, { SizeValue } from '@app/entities/classes/size.entity';
import { DataSource } from 'typeorm';
import Product from '@app/entities/classes/product.entity';

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

  it('debería crear 3 productos con etiquetas', async () => {
    console.log('Iniciando test de creación de productos con etiquetas...');

    console.log('Buscando tamaño Medium...');
    const medium = await dataSource.getRepository(Size).findOneBy({ size: SizeValue.Medium });
    console.log('Medium encontrado:', medium);

    console.log('Buscando tamaño Large...');
    const large = await dataSource.getRepository(Size).findOneBy({ size: SizeValue.Large });
    console.log('Large encontrado:', large);

    console.log('Buscando tamaño ExtraLarge...');
    const xl = await dataSource.getRepository(Size).findOneBy({ size: SizeValue.ExtraLarge });
    console.log('ExtraLarge encontrado:', xl);

    // Verifica que los tamaños se hayan encontrado correctamente
    expect(medium).toBeDefined();
    expect(large).toBeDefined();
    expect(xl).toBeDefined();

    const productos = [
      {
        name: 'Camiseta básica',
        description: 'Camiseta de algodón color blanco',
        stockQuantity: 50,
        price: 9.99,
        size: medium || undefined,
        tags: ['ropa', 'algodón', 'básico', 'camiseta', 'blanco']
      },
      {
        name: 'Pantalón deportivo',
        description: 'Pantalón para correr',
        stockQuantity: 30,
        price: 19.99,
        size: large || undefined,
        tags: ['ropa', 'deportivo', 'pantalón', 'running']
      },
      {
        name: 'Sudadera con capucha',
        description: 'Sudadera gruesa para invierno',
        stockQuantity: 20,
        price: 29.99,
        size: xl || undefined,
        tags: ['ropa', 'invierno', 'sudadera', 'capucha'],
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
        expect(created.tags).toEqual(productos[i].tags);
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

  it('debería obtener todos los productos', async () => {
    console.log('Iniciando test de obtención de productos...');
    try {
      const allProducts = await service.findAll();
      console.log(`Total de productos encontrados: ${allProducts.length}`);
      console.log('Productos:', allProducts.map(p => ({ 
        uuid: p.uuid, 
        name: p.name, 
        size: p.size?.size, 
        imageUrl: p.imageUrl,
        tags: p.tags
      })));
      expect(allProducts.length).toBeGreaterThanOrEqual(3);
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
        tags: p.tags 
      })));
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain(searchTerm);
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
        tags: p.tags 
      })));
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].tags).toContain(searchTag);
    } catch (error) {
      console.error('Error al buscar productos por etiqueta:', error);
      throw error;
    }
  });

  it('debería actualizar etiquetas de un producto', async () => {
    if (createdProductIds.length === 0) {
      console.log('No hay productos creados para actualizar');
      return;
    }

    const productId = createdProductIds[0];
    console.log(`Iniciando test de actualización de etiquetas para producto ${productId}...`);
    
    try {
      const product = await service.findOne(productId);
      console.log('Producto original:', {
        uuid: product.uuid,
        name: product.name,
        tags: product.tags
      });
      
      const newTags = [...(product.tags || []), 'oferta', 'nuevo'];
      
      const updated = await service.update(productId, {
        tags: newTags
      });
      
      console.log('Producto actualizado:', {
        uuid: updated.uuid,
        name: updated.name,
        tags: updated.tags
      });
      
      expect(updated.tags).toContain('oferta');
      expect(updated.tags).toContain('nuevo');
    } catch (error) {
      console.error('Error al actualizar etiquetas del producto:', error);
      throw error;
    }
  });

  it('debería eliminar un producto', async () => {
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
        name: product.name
      });
      
      const result = await service.delete(productId);
      console.log('Resultado de eliminación:', result);
      
      expect(result.message).toContain('eliminado correctamente');
      
      // Verificar que realmente se eliminó
      try {
        await service.findOne(productId);
        fail('El producto debería haber sido eliminado');
      } catch (error) {
        console.log('Producto eliminado correctamente, error esperado:');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  });
});