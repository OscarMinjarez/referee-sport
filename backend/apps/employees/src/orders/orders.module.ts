import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Order        from '@app/entities/classes/order.entity';
import OrderItem    from '@app/entities/classes/orderItem.entity';
import Payment      from '@app/entities/classes/payment.entity';
import OrderEvent   from '@app/entities/classes/orderEvent.entity';
import HistoryOrder from '@app/entities/classes/historyOrder.entity';
import Customer     from '@app/entities/classes/customer.entity';
import Employee     from '@app/entities/classes/employee.entity';
import { OrdersService }    from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Payment,
      OrderEvent,
      HistoryOrder,
      Customer,
      Employee,
    ]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}