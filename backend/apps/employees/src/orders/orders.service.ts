import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository }                      from '@nestjs/typeorm';
import { Repository, ILike }                     from 'typeorm';
import Order                                     from '@app/entities/classes/order.entity';
import OrderItem                                 from '@app/entities/classes/orderItem.entity';
import Payment                                   from '@app/entities/classes/payment.entity';
import OrderEvent, { OrderEventValue }           from '@app/entities/classes/orderEvent.entity';
import HistoryOrder                              from '@app/entities/classes/historyOrder.entity';
import Customer                                  from '@app/entities/classes/customer.entity';
import Employee                                  from '@app/entities/classes/employee.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private itemRepo:  Repository<OrderItem>,
    @InjectRepository(Payment)
    private payRepo:   Repository<Payment>,
    @InjectRepository(OrderEvent)
    private evRepo:    Repository<OrderEvent>,
    @InjectRepository(HistoryOrder)
    private histRepo:  Repository<HistoryOrder>,
    @InjectRepository(Customer)
    private custRepo:  Repository<Customer>,
    @InjectRepository(Employee)
    private empRepo:   Repository<Employee>,
  ) {}

  findAll(): Promise<Order[]> {
    return this.orderRepo.find({
      relations: [
        'orderItems', 'orderItems.product',
        'payments',
        'customer',
        'historyOrders', 'historyOrders.event', 'historyOrders.employee',
      ],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const o = await this.orderRepo.findOne({
      where: { uuid: id },
      relations: [
        'orderItems', 'orderItems.product',
        'payments',
        'customer',
        'historyOrders', 'historyOrders.event', 'historyOrders.employee',
      ],
    });
    if (!o) throw new HttpException('Orden no encontrada', HttpStatus.NOT_FOUND);
    return o;
  }

  findByCustomerName(term: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: [
        { customer: { name:     ILike(`%${term}%`) } },
        { customer: { lastName: ILike(`%${term}%`) } },
      ],
      relations: [
        'orderItems', 'orderItems.product',
        'payments',
        'customer',
        'historyOrders', 'historyOrders.event', 'historyOrders.employee',
      ],
    });
  }

  async create(data: any): Promise<Order> {
    try {
      const order = this.orderRepo.create({
        numberOrder:     data.numberOrder,
        total:           data.total,
        specifications:  data.specifications,
        date:            data.date ? new Date(data.date) : new Date(),
        customer:        { uuid: data.customerId } as Customer,
        orderItems:      (data.orderItems || []).map((i: any) => ({
                           product:    { uuid: i.productId },
                           quantity:   i.quantity,
                           totalPrice: i.totalPrice,
                         })) as any[],
        payments:        (data.payments || []).map((p: any) => ({
                           total:       p.total,
                           paymentState:p.paymentState,
                         })) as any[],
      });

      const saved = await this.orderRepo.save(order);

      // registro inicial “purchased”
      const evPurchased = await this.evRepo.findOne({ where: { event: OrderEventValue.Purchased } })
                            ?? await this.evRepo.save({ event: OrderEventValue.Purchased });
      await this.histRepo.save(
        this.histRepo.create({
          order:    saved,
          employee: { uuid: data.employeeId } as Employee,
          event:    evPurchased,
        })
      );

      return this.findOne(saved.uuid);
    } catch (error) {
      console.error('Error al crear orden:', error); // 👈 imprime el error real
      throw new HttpException('Error al crear orden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, data: any): Promise<Order> {
    const o = await this.findOne(id);

    if (data.numberOrder)    o.numberOrder    = data.numberOrder;
    if (data.total)          o.total          = data.total;
    if (data.specifications) o.specifications = data.specifications;

    if (data.orderItems) {
      await this.itemRepo.remove(o.orderItems);
      o.orderItems = (data.orderItems || []).map((i: any) =>
        this.itemRepo.create({
          order:       o,
          product:     { uuid: i.productId } as any,
          quantity:    i.quantity,
          totalPrice:  i.totalPrice,
        })
      );
    }

    if (data.payments) {
      await this.payRepo.remove(o.payments);
      o.payments = (data.payments || []).map((p: any) =>
        this.payRepo.create({
          order:        o,
          total:        p.total,
          paymentState: p.paymentState,
        })
      );
    }

    // 1) Guardamos los cambios en la orden
    await this.orderRepo.save(o);

    // 2) Registramos el evento "updated" en el historial
    const evUpdated = await this.evRepo.findOne({ where: { event: OrderEventValue.Updated } })
                         ?? await this.evRepo.save({ event: OrderEventValue.Updated });
    await this.histRepo.save(
      this.histRepo.create({
        order:    o,
        employee: { uuid: data.employeeId } as Employee,
        event:    evUpdated,
      })
    );

    // 3) Ahora sí devolvemos la orden **ya con** el nuevo HistoryOrder cargado
    return this.findOne(id);
  }

  /** Marca la orden como “canceled” */
  async cancelOrder(id: string, employeeId: string): Promise<Order> {
    const o = await this.findOne(id);
    const evCanceled = await this.evRepo.findOne({ where: { event: OrderEventValue.Canceled } })
                          ?? await this.evRepo.save({ event: OrderEventValue.Canceled });
    await this.histRepo.save(
      this.histRepo.create({
        order:    o,
        employee: { uuid: employeeId } as Employee,
        event:    evCanceled,
      })
    );
    return this.findOne(id);
  }

  async delete(id: string): Promise<{ message: string }> {
    const o = await this.findOne(id);
    await this.histRepo.remove(o.historyOrders);
    await this.itemRepo.remove(o.orderItems);
    await this.payRepo.remove(o.payments);
    await this.orderRepo.delete(id);
    return { message: 'Orden eliminada correctamente' };
  }
}
