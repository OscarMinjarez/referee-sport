import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository }                      from '@nestjs/typeorm';
import { Repository, ILike }                     from 'typeorm';
import Order                                     from '@app/entities/classes/order.entity';
import OrderItem                                 from '@app/entities/classes/orderItem.entity';
import Payment                                   from '@app/entities/classes/payment.entity';
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
        order,
        employee: { uuid: employeeId } as Employee,
        event:    ev,
      })
    );
  }

  private async updateOrderState(order: Order, employeeId: string) {
    // Calcular suma de pagos que estén confirmados (paymentState = true)
    const sumPayments = order.payments
      .filter(p => p.paymentState) // Solo contar pagos confirmados
      .reduce((sum, p) => sum + p.total, 0);
    
    console.log(`Suma de pagos: ${sumPayments}, Total orden: ${order.total}, Estado actual: ${order.state}`);
    
    if (sumPayments >= order.total && order.state !== OrderStateValue.Finished) {
      order.state = OrderStateValue.Finished;
      await this.orderRepo.save(order);
      await this.recordHistory(order, employeeId, OrderEventValue.Finished);
      console.log('Orden marcada como FINISHED');
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
        // state queda por defecto en Pending
      });

      const saved = await this.orderRepo.save(order);

      // Historial inicial: Purchased
      await this.recordHistory(saved, data.employeeId, OrderEventValue.Purchased);

      // Si el pago inicial cubre el total, cambiar a Finished
      await this.updateOrderState(saved, data.employeeId);

      return this.findOne(saved.uuid);
    } catch (error) {
      console.error('Error al crear orden:', error);
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
      o.orderItems = data.orderItems.map((i: any) =>
        this.itemRepo.create({
          order:       o,
          product:     { uuid: i.productId } as any,
          quantity:    i.quantity,
          totalPrice:  i.totalPrice,
        })
      );
    }

    // CORRECCIÓN: Si solo se proporcionan payments, agregarlos a los existentes
    // en lugar de reemplazarlos completamente
    if (data.payments) {
      // Si se proporciona replacePayments: true, reemplazar completamente
      if (data.replacePayments) {
        await this.payRepo.remove(o.payments);
        o.payments = data.payments.map((p: any) =>
          this.payRepo.create({
            order:        o,
            total:        p.total,
            paymentState: p.paymentState,
          })
        );
      } else {
        // Por defecto, agregar los nuevos pagos a los existentes
        const newPayments = data.payments.map((p: any) =>
          this.payRepo.create({
            order:        o,
            total:        p.total,
            paymentState: p.paymentState,
          })
        );
        
        // Guardar los nuevos pagos
        const savedPayments = await this.payRepo.save(newPayments);
        
        // Agregar al array existente
        o.payments = [...o.payments, ...savedPayments];
      }
    }

    // Guardamos cambios en Order
    await this.orderRepo.save(o);

    // Historial de actualización
    await this.recordHistory(o, data.employeeId, OrderEventValue.Updated);

    // Revisar si pasa a Finished - IMPORTANTE: Recargar la orden para obtener los pagos actualizados
    const reloadedOrder = await this.findOne(id);
    await this.updateOrderState(reloadedOrder, data.employeeId);

    return this.findOne(id);
  }

  // Método auxiliar para agregar un pago específicamente
  async addPayment(orderId: string, employeeId: string, paymentData: { total: number; paymentState: boolean }): Promise<Order> {
    const order = await this.findOne(orderId);
    
    const newPayment = this.payRepo.create({
      order: order,
      total: paymentData.total,
      paymentState: paymentData.paymentState,
    });
    
    await this.payRepo.save(newPayment);
    
    // Registrar en historial
    await this.recordHistory(order, employeeId, OrderEventValue.Updated);
    
    // Verificar si la orden debe cambiar a Finished
    const updatedOrder = await this.findOne(orderId);
    await this.updateOrderState(updatedOrder, employeeId);
    
    return this.findOne(orderId);
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

  async delete(id: string): Promise<{ message: string }> {
    const o = await this.findOne(id);
    await this.histRepo.remove(o.historyOrders);
    await this.itemRepo.remove(o.orderItems);
    await this.payRepo.remove(o.payments);
    await this.orderRepo.delete(id);
    return { message: 'Orden eliminada correctamente' };
  }
}