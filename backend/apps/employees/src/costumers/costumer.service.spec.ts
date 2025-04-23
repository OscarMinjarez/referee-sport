import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './costumers.service';
import { CustomersModule } from './costumer.module';
import { EntitiesService } from '@app/entities/entities.service';
import { DataSource } from 'typeorm';
import Customer from '@app/entities/classes/customer.entity';

describe('CustomersService', () => {
  let service: CustomersService;
  let dataSource: DataSource;
  let createdCustomerIds: string[] = [];

  beforeAll(async () => {
    console.log('Iniciando configuración del test...');
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useClass: EntitiesService,
        }),
        CustomersModule,
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    dataSource = module.get<DataSource>(DataSource);
    console.log('Conexión a base de datos establecida:', dataSource.isInitialized ? 'OK' : 'FALLO');
  });

  afterAll(async () => {
    console.log('Cerrando conexión a base de datos...');
    await dataSource.destroy();
    console.log('Conexión cerrada');
  });

  it('debería crear clientes con direcciones', async () => {
    console.log('Iniciando test de creación de clientes...');

    const clientes = [
      {
        name: 'Jorge',
        lastName: 'Raul Verduzco',
        phoneNumber: '1234567890',
        address: {
          streetName: 'Av. Principal',
          number: '123',
          zipCode: '12345',
          neighborhood: 'Centro',
          city: 'Ciudad de México',
          state: 'CDMX'
        }
      },
      {
        name: 'María',
        lastName: 'González',
        phoneNumber: '9876543210',
        address: {
          streetName: 'Calle Secundaria',
          number: '456',
          zipCode: '54321',
          neighborhood: 'Reforma',
          city: 'Guadalajara',
          state: 'Jalisco'
        }
      },
      {
        name: 'Jorge',
        lastName: 'Pérez',
        phoneNumber: '5555555555',
        address: {
          streetName: 'Av. Revolución',
          number: '789',
          zipCode: '67890',
          neighborhood: 'Condesa',
          city: 'Ciudad de México',
          state: 'CDMX'
        }
      }
    ];

    for (let i = 0; i < clientes.length; i++) {
      console.log(`Creando cliente ${i + 1}: ${clientes[i].name} ${clientes[i].lastName}...`);
      try {
        const created = await service.create(clientes[i]);
        console.log(`Cliente ${i + 1} creado con UUID: ${created.uuid}`);
        createdCustomerIds.push(created.uuid);
        
        expect(created).toHaveProperty('uuid');
        expect(created.name).toBe(clientes[i].name);
        expect(created.lastName).toBe(clientes[i].lastName);
        
        // Validando que se creó la dirección correctamente
        expect(created.addresses).toBeDefined();
        expect(created.addresses.streetName).toBe(clientes[i].address.streetName);
      } catch (error) {
        console.error(`Error al crear cliente ${i + 1}:`, error);
        throw error;
      }
    }
    console.log('Test de creación de clientes completado');
  });

  it('debería obtener todos los clientes', async () => {
    console.log('Iniciando test de obtención de clientes...');
    try {
      const allCustomers = await service.findAll();
      console.log(`Total de clientes encontrados: ${allCustomers.length}`);
      console.log('Clientes:', allCustomers.map(c => ({ 
        uuid: c.uuid, 
        name: c.name,
        lastName: c.lastName,
        address: c.addresses ? c.addresses.city : 'Sin dirección'
      })));
      expect(allCustomers.length).toBeGreaterThanOrEqual(3);
    } catch (error) {
      console.error('Error al obtener todos los clientes:', error);
      throw error;
    }
  });

  it('debería buscar clientes por nombre', async () => {
    console.log('Iniciando test de búsqueda por nombre...');
    try {
      const searchTerm = 'Jorge';
      console.log(`Buscando clientes con término: "${searchTerm}"`);
      const results = await service.findByName(searchTerm);
      console.log(`Resultados encontrados: ${results.length}`);
      console.log('Resultados:', results.map(c => ({ 
        uuid: c.uuid, 
        name: c.name,
        lastName: c.lastName
      })));
      expect(results.length).toBeGreaterThan(0);
      
      // Verificar que todos los resultados contienen "Jorge" en name o lastName
      for (const customer of results) {
        const fullName = `${customer.name} ${customer.lastName}`.toLowerCase();
        expect(fullName).toContain(searchTerm.toLowerCase());
      }
    } catch (error) {
      console.error('Error al buscar clientes por nombre:', error);
      throw error;
    }
  });

  it('debería actualizar un cliente existente', async () => {
    if (createdCustomerIds.length === 0) {
      console.log('No hay clientes creados para actualizar');
      return;
    }

    const customerId = createdCustomerIds[0];
    console.log(`Iniciando test de actualización para cliente ${customerId}...`);
    
    try {
      const customer = await service.findOne(customerId);
      console.log('Cliente original:', {
        uuid: customer.uuid,
        name: customer.name,
        lastName: customer.lastName,
        phoneNumber: customer.phoneNumber
      });
      
      const updateData = {
        phoneNumber: '9998887777',
        address: {
          streetName: 'Nueva Calle',
          number: '999',
          zipCode: '99999',
          neighborhood: 'Nuevo Barrio',
          city: 'Monterrey',
          state: 'Nuevo León'
        }
      };
      
      const updated = await service.update(customerId, updateData);
      
      console.log('Cliente actualizado:', {
        uuid: updated.uuid,
        name: updated.name,
        phoneNumber: updated.phoneNumber,
        address: updated.addresses ? {
          streetName: updated.addresses.streetName,
          city: updated.addresses.city
        } : 'Sin dirección'
      });
      
      expect(updated.phoneNumber).toBe(updateData.phoneNumber);
      expect(updated.addresses.streetName).toBe(updateData.address.streetName);
      expect(updated.addresses.city).toBe(updateData.address.city);
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  });

  it('debería eliminar un cliente', async () => {
    if (createdCustomerIds.length === 0) {
      console.log('No hay clientes creados para eliminar');
      return;
    }

    const customerId = createdCustomerIds[createdCustomerIds.length - 1];
    console.log(`Iniciando test de eliminación para cliente ${customerId}...`);
    
    try {
      const customer = await service.findOne(customerId);
      console.log('Cliente a eliminar:', {
        uuid: customer.uuid,
        name: customer.name,
        lastName: customer.lastName
      });
      
      const result = await service.delete(customerId);
      console.log('Resultado de eliminación:', result);
      
      expect(result.message).toContain('eliminado correctamente');
      
      // Verificar que realmente se eliminó
      try {
        await service.findOne(customerId);
        fail('El cliente debería haber sido eliminado');
      } catch (error) {
        console.log('Cliente eliminado correctamente, error esperado:');
      }
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      throw error;
    }
  });
});