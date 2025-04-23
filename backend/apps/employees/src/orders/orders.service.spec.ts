import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule }       from '@nestjs/typeorm';
import { OrdersService }       from './orders.service';
import { OrdersModule }        from './orders.module';
import { EntitiesService }     from '@app/entities/entities.service';
import { DataSource }          from 'typeorm';
import Customer                from '@app/entities/classes/customer.entity';
import Product                 from '@app/entities/classes/product.entity';
import Employee                from '@app/entities/classes/employee.entity';
import { EmployeeTypeValue }   from '@app/entities/classes/employeeType.entity';
import OrderEvent, { OrderEventValue } from '@app/entities/classes/orderEvent.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let ds: DataSource;

  let testCustomer: Customer;
  let testProduct:  Product;
  let testEmployee: Employee;

  let createdOrderId: string;

  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({ useClass: EntitiesService }),
        OrdersModule,
      ],
    }).compile();

    service = mod.get<OrdersService>(OrdersService);
    ds      = mod.get<DataSource>(DataSource);

    // seed guest entities
    const custRepo = ds.getRepository(Customer);
    testCustomer = await custRepo.save({
      name: 'Pepito', lastName: 'Pérez', phoneNumber: '555000111',
    });

    const prodRepo = ds.getRepository(Product);
    testProduct   = await prodRepo.save({
      name: 'Test Prod', description: 'Desc', price: 10.5, tags: [],
    });

    const empRepo = ds.getRepository(Employee);
    testEmployee = await empRepo.save({
      username: 'emp1',
      email:    'e@e.com',
      password: 'x',
      type:     EmployeeTypeValue.Sales,
    });
  });

  afterAll(async () => {
    await ds.destroy();
  });

  it('debería crear una orden con ítems y pagos', async () => {
    const dto = {
      customerId:     testCustomer.uuid,
      employeeId:     testEmployee.uuid,
      numberOrder:    1001,
      total:          123.45,
      specifications: 'Sin especificaciones',
      orderItems:     [{ productId: testProduct.uuid, quantity: 2, totalPrice: 21 }],
      payments:       [{ total: 21, paymentState: true }],
    };
    const ord = await service.create(dto);
    createdOrderId = ord.uuid;

    expect(ord).toHaveProperty('uuid');
    expect(ord.orderItems.length).toBe(1);
    expect(ord.payments.length).toBe(1);
    expect(ord.historyOrders[0].event.event).toBe(OrderEventValue.Purchased);
  });

  it('debería obtener todas las órdenes', async () => {
    const all = await service.findAll();
    expect(all.length).toBeGreaterThanOrEqual(1);
  });

  it('debería buscar por nombre de cliente', async () => {
    const byName = await service.findByCustomerName('pepito');
    expect(byName.length).toBeGreaterThan(0);
    expect(byName[0].customer.name.toLowerCase()).toContain('pepito');
  });

  it('debería actualizar la orden', async () => {
    const updDto = {
      employeeId:     testEmployee.uuid,
      total:          999,
      specifications: 'Actualizada',
      orderItems:     [{ productId: testProduct.uuid, quantity: 5, totalPrice: 52 }],
      payments:       [{ total: 52, paymentState: false }],
    };
    const updated = await service.update(createdOrderId, updDto);
    expect(updated.total).toBe(999);
    expect(updated.orderItems[0].quantity).toBe(5);
    const hasUpd = updated.historyOrders.some(h => h.event.event === OrderEventValue.Updated);
    expect(hasUpd).toBeTruthy();
  });

  it('debería cancelar la orden', async () => {
    const canceled = await service.cancelOrder(createdOrderId, testEmployee.uuid);
    const hasCanceled = canceled.historyOrders.some(h => h.event.event === OrderEventValue.Canceled);
    expect(hasCanceled).toBeTruthy();
  });

  it('debería eliminar la orden', async () => {
    const res = await service.delete(createdOrderId);
    expect(res.message).toContain('eliminada correctamente');
    await expect(service.findOne(createdOrderId)).rejects.toThrow();
  });
});
