import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository }                      from '@nestjs/typeorm';
import { Repository, ILike }                     from 'typeorm';
import Order                                     from '@app/entities/classes/order.entity';
import OrderItem                                 from '@app/entities/classes/orderItem.entity';
import Payment, { PaymentState }                                   from '@app/entities/classes/payment.entity';
import OrderEvent, { OrderEventValue }           from '@app/entities/classes/orderEvent.entity';
import { OrderStateValue }                       from '@app/entities/classes/order.entity';
import HistoryOrder                              from '@app/entities/classes/historyOrder.entity';
import Customer                                  from '@app/entities/classes/customer.entity';
import Employee                                  from '@app/entities/classes/employee.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)       private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)   private itemRepo:  Repository<OrderItem>,
    @InjectRepository(Payment)     private payRepo:   Repository<Payment>,
    @InjectRepository(OrderEvent)  private evRepo:    Repository<OrderEvent>,
    @InjectRepository(HistoryOrder)private histRepo:  Repository<HistoryOrder>,
    @InjectRepository(Customer)    private custRepo:  Repository<Customer>,
    @InjectRepository(Employee)    private empRepo:   Repository<Employee>,
  ) {}

  private async recordHistory(order: Order, employeeId: string, eventValue: OrderEventValue) {
    const ev = await this.evRepo.findOne({ where: { event: eventValue } })
               ?? await this.evRepo.save({ event: eventValue });
    await this.histRepo.save(
      this.histRepo.create({
        order: { uuid: order.uuid } as Order,
        employee: { uuid: employeeId } as Employee,
        event:    ev,
      })
    );
  }

  private async updateOrderState(order: Order, employeeId: string) {
    const totalPaid = order.payments
      .filter(p => p.state === PaymentState.Completed || p.state === PaymentState.Partial)
      .reduce((sum, p) => sum + p.amountPaid, 0);
    if (totalPaid >= order.total && order.state !== OrderStateValue.Finished) {
      order.state = OrderStateValue.Finished;
      await this.orderRepo.save(order);
      await this.recordHistory(order, employeeId, OrderEventValue.Finished);
    } else if (totalPaid < order.total && order.state === OrderStateValue.Finished) {
      order.state = OrderStateValue.Pending;
      await this.orderRepo.save(order);
    }
  }

  findAll(): Promise<Order[]> {
  return this.orderRepo.find({
    relations: [
      'orderItems', 
      'orderItems.product',
      'payments',
      'customer',
      'customer.addresses',
      'historyOrders', 
      'historyOrders.event', 
      'historyOrders.employee',
    ],
    order: { date: 'DESC' },
  });
}

 async findOne(id: string): Promise<Order> {
  const o = await this.orderRepo.findOne({
    where: { uuid: id },
    relations: [
      'orderItems', 
      'orderItems.product',
      'payments',
      'customer',
      'customer.addresses',
      'historyOrders', 
      'historyOrders.event',     // ✅ Ya estaba
      'historyOrders.employee',  // ✅ Ya estaba
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
        'orderItems', 
        'orderItems.product',
        'payments',
        'customer',
        'historyOrders', 
        'historyOrders.event', 
        'historyOrders.employee',
      ],
    });
  }

  async create(data: any): Promise<Order> {
    try {
      const order = this.orderRepo.create({
        numberOrder: data.numberOrder,
        total: data.total,
        specifications: data.specifications,
        date: data.date ? new Date(data.date) : new Date(),
        customer: { uuid: data.customerId } as Customer,
        orderItems: (data.orderItems || []).map((i: any) => ({
          product: { uuid: i.productId },
          quantity: i.quantity,
          totalPrice: i.totalPrice,
        })) as any[],
        payments: (data.payments || []).map((p: any) => ({
          total: p.total,
          paymentState: false,
        })) as any[],
      });
      const saved = await this.orderRepo.save(order);
      await this.recordHistory(saved, data.employeeId, OrderEventValue.Purchased);
      await this.updateOrderState(saved, data.employeeId);
      return this.findOne(saved.uuid);
    } catch (error) {
      console.error('Error al crear orden:', error);
      throw new HttpException('Error al crear orden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, data: any): Promise<Order> {
    const order = await this.findOne(id);
    const previousTotal = order.total;
    if (data.numberOrder) order.numberOrder = data.numberOrder;
    if (data.specifications) order.specifications = data.specifications;
    if (data.orderItems) {
      await this.itemRepo.remove(order.orderItems);
      order.orderItems = data.orderItems.map((i: { productId: string; quantity: number; totalPrice: number }) =>
        this.itemRepo.create({
            order: order,
            product: { uuid: i.productId },
            quantity: i.quantity,
            totalPrice: i.totalPrice,
        })
      );
      order.total = data.orderItems.reduce(
        (sum: number, item: { totalPrice: number }) => sum + item.totalPrice, 
        0
      );
    } else if (data.total) {
      order.total = data.total;
    }
    await this.orderRepo.save(order);
    if (data.orderItems && previousTotal !== order.total) {
    let difference = previousTotal - order.total;
    if (difference > 0) {
        const payments = [...order.payments].sort((a, b) => b.total - a.total);
        for (const payment of payments) {
          if (difference <= 0) break;
          if (payment.state === PaymentState.Pending || payment.state === PaymentState.Completed) {
            const adjustableAmount = Math.min(payment.total, difference);
            if (adjustableAmount === payment.total) {
              payment.state = PaymentState.Canceled;
            } else {
                const newPayment = this.payRepo.create({
                  order: order,
                  total: payment.total - adjustableAmount,
                  state: payment.state
                });
                payment.total = adjustableAmount;
                payment.state = PaymentState.Adjusted;
                await this.payRepo.save(newPayment);
            }
            await this.payRepo.save(payment);
            difference -= adjustableAmount;
          }
        }
      } else {
          const newPayment = this.payRepo.create({
            order: order,
            total: Math.abs(difference),
            state: PaymentState.Pending
          });
          await this.payRepo.save(newPayment);
      }
    }
    if (data.employeeId) {
      await this.recordHistory(order, data.employeeId, OrderEventValue.Updated);
      await this.updateOrderState(order, data.employeeId);
    }
    return this.findOne(id);
  }

  async addPayment(
    orderId: string, 
    employeeId: string, 
    paymentData: { 
      amount: number;
      total?: number;
      date?: Date;
    }
  ): Promise<Order> {
    const order = await this.findOne(orderId);
    const paymentTotal = paymentData.total || paymentData.amount;
    const isPartialPayment = paymentData.amount < paymentTotal;
    const newPayment = this.payRepo.create({
      order: order,
      total: paymentTotal,
      amountPaid: paymentData.amount,
      state: isPartialPayment ? PaymentState.Partial : PaymentState.Completed,
      date: paymentData.date || new Date()
    });
    await this.payRepo.save(newPayment);
    await this.recordHistory(
      order, 
      employeeId, 
      isPartialPayment ? OrderEventValue.PartialPayment : OrderEventValue.PaymentAdded
    );
    await this.updateOrderState(order, employeeId);
    return this.findOne(orderId);
  }
  
  async completePayment(
    paymentId: string,
    amount: number,
    employeeId: string
  ): Promise<Order> {
    const payment = await this.payRepo.findOne({ 
      where: { uuid: paymentId },
      relations: ['order']
    });
    if (!payment) {
      throw new HttpException('Pago no encontrado', HttpStatus.NOT_FOUND);
    }
    if (payment.state !== PaymentState.Partial) {
      throw new HttpException('Solo se pueden completar pagos parciales', HttpStatus.BAD_REQUEST);
    }
    const remaining = payment.total - payment.amountPaid;
    if (amount > remaining) {
      throw new HttpException(`El monto no puede exceder $${remaining}`, HttpStatus.BAD_REQUEST);
    }
    payment.amountPaid += amount;
    if (payment.amountPaid >= payment.total) {
      payment.state = PaymentState.Completed;
    }
    await this.payRepo.save(payment);
    await this.recordHistory(payment.order, employeeId, OrderEventValue.PaymentCompleted);
    await this.updateOrderState(payment.order, employeeId);
    return this.findOne(payment.order.uuid);
  }

  /** Marca la orden como "canceled" */
  async cancelOrder(id: string, employeeId: string): Promise<Order> {
    const o = await this.findOne(id);

    // Cambiar estado
    o.state = OrderStateValue.Canceled;
    await this.orderRepo.save(o);

    // Historial Canceled
    await this.recordHistory(o, employeeId, OrderEventValue.Canceled);

    return this.findOne(id);
  }

  async delete(uuid: string): Promise<{ message: string }> {
    const order = await this.orderRepo.findOne({
      where: { uuid },
      relations: ['orderItems', 'payments', 'historyOrders'],
    });
    if (!order) throw new Error('Orden no encontrada');
    await this.orderRepo.remove(order);
    return { message: 'Orden eliminada correctamente' };
  }
}