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
import { CreateOrderDto }                        from './dto/CreateOrder.dto';
import ProductVariant from '@app/entities/classes/productVariant.entity';
import { UpdateOrderDto } from './dto/UpdateOrder.dto';
import Product from '@app/entities/classes/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)       private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)   private itemRepo:  Repository<OrderItem>,
    @InjectRepository(Payment)     private payRepo:   Repository<Payment>,
    @InjectRepository(OrderEvent)  private evRepo:    Repository<OrderEvent>,
    @InjectRepository(HistoryOrder) private histRepo:  Repository<HistoryOrder>
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
      'orderItems.productVariant',
      'orderItems.productVariant.variant',
      'payments',
      'customer',
      'customer.addresses',
      'historyOrders', 
      'historyOrders.event',
      'historyOrders.employee',
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

  async create(data: CreateOrderDto): Promise<Order> {
    try {
      const order = this.orderRepo.create({
        numberOrder: data.numberOrder,
        total: data.total,
        specifications: data.specifications,
        date: data.date ? new Date(data.date) : new Date(),
        customer: { uuid: data.customerId } as Customer,
        orderItems: (data.orderItems || []).map((i) => ({
          product: { uuid: i.productId },
          productVariant: { uuid: i.productVariantId },
          quantity: i.quantity,
          totalPrice: i.totalPrice,
        })),
        payments: (data.payments || []).map((p) => ({
          total: p.total,
          paymentState: false,
        })),
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

  async update(id: string, data: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    const previousTotal = order.total;
    if (data.numberOrder !== undefined) order.numberOrder = data.numberOrder;
    if (data.specifications !== undefined) order.specifications = data.specifications;
    if (data.date !== undefined) order.date = new Date(data.date);
    if (data.customerId !== undefined) order.customer = { uuid: data.customerId } as Customer;
    if (data.orderItems) {
      const itemsToRemove = order.orderItems.filter(
        existingItem => !data.orderItems?.some(newItem => newItem.uuid === existingItem.uuid)
      );
      await this.itemRepo.remove(itemsToRemove);
      order.orderItems = await Promise.all(data.orderItems.map(async (itemDto) => {
        if (itemDto.uuid) {
          const existingItem = order.orderItems.find(i => i.uuid === itemDto.uuid);
          if (existingItem) {
            existingItem.quantity = itemDto.quantity;
            existingItem.totalPrice = itemDto.totalPrice;
            existingItem.product = { uuid: itemDto.productId } as Product;
            existingItem.productVariant = { uuid: itemDto.productVariantId } as ProductVariant;
            return this.itemRepo.save(existingItem);
          }
        }
        const newItem = this.itemRepo.create({
          order: order,
          product: { uuid: itemDto.productId },
          productVariant: { uuid: itemDto.productVariantId },
          quantity: itemDto.quantity,
          totalPrice: itemDto.totalPrice
        });
        return this.itemRepo.save(newItem);
      }));
      order.total = data.orderItems.reduce(
        (sum, item) => sum + item.totalPrice, 
        0
      );
    } else if (data.total !== undefined) {
      order.total = data.total;
    }
    if (data.payments) {
      const paymentsToRemove = order.payments.filter(
        existingPayment => !data.payments?.some(newPayment => newPayment.uuid === existingPayment.uuid)
      );
      if (paymentsToRemove.length > 0) {
        await this.payRepo.remove(paymentsToRemove);
      }
      const updatedPayments: Payment[] = [];
      for (const paymentDto of data.payments) {
        if (paymentDto.uuid) {
          const existingPayment = order.payments.find(p => p.uuid === paymentDto.uuid);
          if (existingPayment) {
            existingPayment.total = paymentDto.total;
            if (paymentDto.state) {
              existingPayment.state = paymentDto.state as PaymentState;
            }
            updatedPayments.push(await this.payRepo.save(existingPayment));
            continue;
          }
        }
        const newPayment = this.payRepo.create({
          order: order,
          total: paymentDto.total,
          state: paymentDto.state as PaymentState || PaymentState.Pending
        });
        updatedPayments.push(await this.payRepo.save(newPayment));
      }
      order.payments = updatedPayments;
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