import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import Order from '@app/entities/classes/order.entity';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  findAll(): Promise<Order[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Order> {
    return this.service.findOne(id);
  }

  @Get('by-customer/:term')
  findByCustomerName(@Param('term') term: string): Promise<Order[]> {
    return this.service.findByCustomerName(term);
  }

  @Post()
  create(@Body() body: any): Promise<Order> {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any): Promise<Order> {
    return this.service.update(id, body);
  }

  /** Agrega un pago específico a una orden existente */
  @Put(':id/add-payment/:employeeId')
  addPayment(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
    @Body() paymentData: { 
      amount: number;
      total?: number;
      date?: Date;
    }
  ): Promise<Order> {
    return this.service.addPayment(id, employeeId, paymentData);
  }

  /** Cambia el estado a "canceled" añadiendo un HistoryOrder */
  @Put(':id/cancel/:employeeId')
  cancel(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ): Promise<Order> {
    return this.service.cancelOrder(id, employeeId);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id);
  }
}