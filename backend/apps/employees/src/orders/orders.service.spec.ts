import { Test, TestingModule }          from '@nestjs/testing';
import { TypeOrmModule }                from '@nestjs/typeorm';
import { OrdersService }                from './orders.service';
import { OrdersModule }                 from './orders.module';
import { EntitiesService }              from '@app/entities/entities.service';
import { DataSource }                   from 'typeorm';

import Customer                         from '@app/entities/classes/customer.entity';
import Product                          from '@app/entities/classes/product.entity';
import Employee                         from '@app/entities/classes/employee.entity';
import { EmployeeTypeValue }            from '@app/entities/classes/employeeType.entity';

import OrderEvent, { OrderEventValue }  from '@app/entities/classes/orderEvent.entity';
import Order, { OrderStateValue }       from '@app/entities/classes/order.entity';
import OrderItem                        from '@app/entities/classes/orderItem.entity';
import Payment                          from '@app/entities/classes/payment.entity';
import HistoryOrder                     from '@app/entities/classes/historyOrder.entity';
describe('OrdersService (Integration)', () => {
  let service: OrdersService;
  let dataSource: DataSource;

  let testCustomer: Customer;
  let testProduct:  Product;
  let testEmployee: Employee;
  let createdOrderId: string;

  beforeAll(async () => {
    console.log('Inicializando módulo de pruebas...');
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({ useClass: EntitiesService }),
        OrdersModule,
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    dataSource = module.get<DataSource>(DataSource);
    console.log('Conexión a base de datos:', dataSource.isInitialized ? '✔︎ Inicializada' : '✘ Fallo');

    await dataSource.synchronize(true);
    console.log('Esquema sincronizado en la base de datos.');

    // Seed customer
    const custRepo = dataSource.getRepository(Customer);
    testCustomer = await custRepo.save({
      name: 'Pepito',
      lastName: 'Pérez',
      phoneNumber: '555000111',
    });
    console.log('Cliente de prueba creado:', testCustomer.uuid);

    // Seed product
    const prodRepo = dataSource.getRepository(Product);
    testProduct = await prodRepo.save({
      name: 'Test Prod',
      description: 'Desc',
      price: 10.5,
      tags: [],
    });
    console.log('Producto de prueba creado:', testProduct.uuid);

    // Seed employee
    const empRepo = dataSource.getRepository(Employee);
    testEmployee = await empRepo.save({
      username: 'emp1',
      email: 'e@e.com',
      password: 'x',
      type: EmployeeTypeValue.Sales,
    });
    console.log('Empleado de prueba creado:', testEmployee.uuid);
  });

  afterAll(async () => {
    console.log('Cerrando conexión...');
    await dataSource.destroy();
    console.log('Conexión cerrada.');
  });

  it('crear orden PENDING y registrar Purchased', async () => {
    const dto = {
      customerId:     testCustomer.uuid,
      employeeId:     testEmployee.uuid,
      numberOrder:    1001,
      total:          200,
      specifications: 'Sin especificaciones',
      orderItems:     [{ productId: testProduct.uuid, quantity: 2, totalPrice: 21 }],
      payments:       [{ total: 21, paymentState: true }],
    };

    const ord = await service.create(dto);
    createdOrderId = ord.uuid;
    console.log('Orden creada:', ord);

    expect(ord.state).toBe(OrderStateValue.Pending);
    const events = ord.historyOrders.map(h => h.event.event);
    expect(events).toContain(OrderEventValue.Purchased);
  });

  it('completar orden al alcanzar total y registrar Finished', async () => {
    const updDto = {
      employeeId: testEmployee.uuid,
      payments:   [{ total: 179, paymentState: true }],
    };
    const updated = await service.update(createdOrderId, updDto);
    console.log('Orden tras pago adicional:', updated);

    expect(updated.state).toBe(OrderStateValue.Finished);
    const events = updated.historyOrders.map(h => h.event.event);
    expect(events).toContain(OrderEventValue.Finished);
  });

  it('buscar orden por nombre de cliente', async () => {
    const byName = await service.findByCustomerName('pepito');
    console.log('Resultados de búsqueda:', byName);

    expect(byName.length).toBeGreaterThan(0);
    expect(byName[0].customer.name.toLowerCase()).toContain('pepito');
  });

  it('actualizar datos generales y registrar Updated', async () => {
    const updDto = {
      employeeId:     testEmployee.uuid,
      total:          999,
      specifications: 'Actualizada',
      orderItems:     [{ productId: testProduct.uuid, quantity: 5, totalPrice: 52 }],
    };
    const updated = await service.update(createdOrderId, updDto);
    console.log('Orden tras actualización general:', updated);

    expect(updated.total).toBe(999);
    expect(updated.orderItems[0].quantity).toBe(5);
    expect(updated.historyOrders.some(h => h.event.event === OrderEventValue.Updated)).toBeTruthy();
  });

  it('cancelar orden y registrar Canceled', async () => {
    const canceled = await service.cancelOrder(createdOrderId, testEmployee.uuid);
    console.log('Orden cancelada:', canceled);

    expect(canceled.state).toBe(OrderStateValue.Canceled);
    expect(canceled.historyOrders.some(h => h.event.event === OrderEventValue.Canceled)).toBeTruthy();
  });

  it('eliminar orden', async () => {
    const res = await service.delete(createdOrderId);
    console.log('Resultado delete:', res);

    expect(res.message).toContain('eliminada correctamente');
    await expect(service.findOne(createdOrderId)).rejects.toThrow();
  });
});