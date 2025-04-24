import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsModule } from './products.module';
import { EntitiesService } from '@app/entities/entities.service';
import Size, { SizeValue } from '@app/entities/classes/size.entity';
import { DataSource } from 'typeorm';
import Tag from '@app/entities/classes/tag.entity';
import { CreateProductDto } from './dto/CreateProduct.dto';
import { VariantDto } from './dto/variant.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let dataSource: DataSource;
  const createdProductIds: string[] = [];

  beforeAll(async () => {
    console.log('Iniciando configuración del test...');
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({ useClass: EntitiesService }),
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
        tagNames: ['ropa', 'deportivo', 'HUAWEI', 'running'],
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
        // imagePath: 'C:/Users/JORGE/.../futbol.jpg'
      },
    ];

    console.log('Productos a crear:', JSON.stringify(productos, null, 2));
    try {
      for (let i = 0; i < productos.length; i++) {
        console.log(`Creando producto ${i + 1}: ${productos[i].name}...`);
        const created = await service.create(productos[i]);
        console.log(`Producto ${i + 1} creado con UUID: ${created.uuid}`);
        createdProductIds.push(created.uuid);

        expect(created).toHaveProperty('uuid');
        expect(created.name).toBe(productos[i].name);

        // Verificar tags (existencia)
        if (productos[i].tagNames) {
          for (const tagName of productos[i].tagNames!) {
            expect(
              created.tags!.some(t => t.name.toLowerCase() === tagName.toLowerCase())
            ).toBeTruthy();
          }
        }


        // Si hubiera imagePath, se validaría imageUrl
        if ((productos[i] as any).imagePath) {
          expect(created.imageUrl).toBeDefined();
          console.log(`Producto ${i + 1} tiene imageUrl: ${created.imageUrl}`);
        }
      }
      console.log('Test de creación de productos completado');
    } catch (error) {
      console.error('Error en creación de productos:', error);
      throw error;
    }
  });

  it('debería obtener todos los productos con sus variantes y tags', async () => {
    console.log('Iniciando test de obtención de productos...');
    try {
      const allProducts = await service.findAll();
      console.log(`Total de productos encontrados: ${allProducts.length}`);
      console.log('Productos:', allProducts.map(p => ({
        uuid: p.uuid,
        name: p.name,
        variants: p.variants.map(v => ({ size: v.size.size, quantity: v.quantity })),
        imageUrl: p.imageUrl,
        tags: p.tags ? p.tags.map(t => t.name) : []
      })));
      expect(allProducts.length).toBeGreaterThanOrEqual(3);
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
      const term = 'Camiseta';
      console.log(`Buscando productos con término: "${term}"`);
      const results = await service.findByName(term);
      console.log(`Resultados encontrados: ${results.length}`);
      console.log('Resultados:', results.map(p => ({
        uuid: p.uuid, name: p.name, imageUrl: p.imageUrl, tags: p.tags ? p.tags.map(t => t.name) : []
      })));
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain(term);
      for (const p of results) {
        expect(p.variants).toBeDefined();
        expect(p.tags).toBeDefined();
      }
    } catch (error) {
      console.error('Error en búsqueda por nombre:', error);
      throw error;
    }
  });

  it('debería buscar productos por etiqueta', async () => {
    console.log('Iniciando test de búsqueda por etiqueta...');
    try {
      const tagTerm = 'deportivo';
      console.log(`Buscando productos con etiqueta: "${tagTerm}"`);
      const results = await service.findByTag(tagTerm);
      console.log(`Resultados encontrados: ${results.length}`);
      console.log('Resultados:', results.map(p => ({
        uuid: p.uuid,
        name: p.name,
        tags: p.tags ? p.tags.map(t => t.name) : [],
        variants: p.variants.length
      })));
      expect(results.length).toBeGreaterThan(0);
      for (const p of results) {
        expect(p.tags.some(t => t.name.toLowerCase().includes(tagTerm))).toBeTruthy();
        expect(p.variants).toBeDefined();
      }
    } catch (error) {
      console.error('Error en búsqueda por etiqueta:', error);
      throw error;
    }
  });

  it('debería listar todas las etiquetas únicas en la base de datos', async () => {
    const tagRepo = dataSource.getRepository(Tag);
    const tags = await tagRepo.find();
    const names = tags.map(t => t.name);
    expect(names.length).toBe(new Set(names).size);
    console.log('Tags en BD:', names);
  });

  it('debería crear productos adicionales sin imagen y verificar tags compartidos', async () => {
    console.log('Iniciando test de productos adicionales...');
    const adicionales: CreateProductDto[] = [
      { name: 'Gorra de verano', description: 'Gorra ligera para el sol', price: 12.5, tagNames: ['ropa', 'verano', 'gorro', 'común'], variants: [{ size: SizeValue.Medium, quantity: 25 }] },
      { name: 'Calcetines deportivos', description: 'Calcetines transpirables', price: 5.5, tagNames: ['ropa', 'deportivo', 'calcetines', 'común'], variants: [{ size: SizeValue.Large, quantity: 40 }] }
    ];
    const tagRepo = dataSource.getRepository(Tag);
    const before = (await tagRepo.find()).length;
    for (const dto of adicionales) {
      const created = await service.create(dto);
      createdProductIds.push(created.uuid);
      // Verificar existencia de tags
      for (const tagName of dto.tagNames!) {
        expect(created.tags!.some(t => t.name.toLowerCase() === tagName.toLowerCase())).toBeTruthy();
      }
    }
    const after = await tagRepo.find();
    const names2 = after.map(t => t.name);
    expect(after.length).toBe(new Set(names2).size);
    expect(after.length).toBeGreaterThanOrEqual(before);
    console.log('Tags tras productos adicionales:', names2);
  });

  it('debería actualizar etiquetas y variantes de un producto', async () => {
    expect(createdProductIds.length).toBeGreaterThan(0);
    const id = createdProductIds[0];
    console.log(`Iniciando test de actualización para producto ${id}...`);
    try {
      const product = await service.findOne(id);
      console.log('Producto original:', {
        uuid: product.uuid,
        name: product.name,
        tags: product.tags ? product.tags.map(t => t.name) : [],
        variants: product.variants.map(v => ({ size: v.size.size, quantity: v.quantity }))
      });
      const newTags = ['oferta', 'nuevo', 'destacado'];
      const newVariants: VariantDto[] = [
        { size: SizeValue.Small, quantity: 5 },
        { size: SizeValue.Medium, quantity: 15 },
        { size: SizeValue.Large, quantity: 10 }
      ];
      const updated = await service.update(id, { tagNames: newTags, variants: newVariants });
      console.log('Producto actualizado:', {
        uuid: updated.uuid,
        tags: updated.tags!.map(t => t.name),
        variants: updated.variants.map(v => ({ size: v.size.size, quantity: v.quantity }))
      });
      expect(updated.tags!.length).toBe(newTags.length);
      expect(updated.variants.length).toBe(newVariants.length);
      const small = updated.variants.find(v => v.size.size === SizeValue.Small);
      expect(small).toBeDefined();
      expect(small!.quantity).toBe(5);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  });

  it('debería eliminar un producto y sus variantes', async () => {
    expect(createdProductIds.length).toBeGreaterThan(0);
    const id = createdProductIds.pop()!;
    console.log(`Iniciando test de eliminación para producto ${id}...`);
    try {
      const product = await service.findOne(id);
      console.log('Producto a eliminar:', {
        uuid: product.uuid,
        name: product.name,
        variants: product.variants.length,
        tags: product.tags ? product.tags.length : 0
      });
      const result = await service.delete(id);
      console.log('Resultado de eliminación:', result);
      expect(result.message).toContain('eliminado correctamente');
      // Verificar eliminación definitiva
      try {
        await service.findOne(id);
        fail('El producto debería haber sido eliminado');
      } catch {
        console.log('Producto eliminado correctamente, error esperado');
      }
    } catch (error) {
      console.error('Error en prueba de eliminación:', error);
      throw error;
    }
  });
});
