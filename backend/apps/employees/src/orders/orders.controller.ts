import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import Order from '@app/entities/classes/order.entity';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/UpdateOrder.dto';
import { CreateOrderDto } from './dto/CreateOrder.dto';
import { Roles } from '../auths/decorators/roles.decorator';
import { EmployeeTypeValue } from '@app/entities';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  @Roles(EmployeeTypeValue.Sales, EmployeeTypeValue.Admin, EmployeeTypeValue.Store)
  findAll(): Promise<Order[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(EmployeeTypeValue.Sales, EmployeeTypeValue.Admin, EmployeeTypeValue.Store)
  findOne(@Param('id') id: string): Promise<Order> {
    return this.service.findOne(id);
  }

  @Get('by-customer/:term')
  findByCustomerName(@Param('term') term: string): Promise<Order[]> {
    return this.service.findByCustomerName(term);
  }

  @Post()
  @Roles(EmployeeTypeValue.Sales, EmployeeTypeValue.Admin)
  create(@Body(new ValidationPipe()) body: CreateOrderDto): Promise<Order> {
    return this.service.create(body);
  }

  @Put(':id')
  @Roles(EmployeeTypeValue.Sales, EmployeeTypeValue.Admin)
  update(@Param('id') id: string, @Body(new ValidationPipe()) body: UpdateOrderDto): Promise<Order> {
    return this.service.update(id, body);
  }

  @Put(':id/add-payment/:employeeId')
  @Roles(EmployeeTypeValue.Sales, EmployeeTypeValue.Admin)
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

  @Put(':id/cancel/:employeeId')
  @Roles(EmployeeTypeValue.Sales, EmployeeTypeValue.Admin)
  cancel(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ): Promise<Order> {
    return this.service.cancelOrder(id, employeeId);
  }

  @Delete(':id')
  @Roles(EmployeeTypeValue.Admin)
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id);
  }
}