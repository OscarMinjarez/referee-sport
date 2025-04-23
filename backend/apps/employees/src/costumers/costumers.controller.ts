import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query
  } from '@nestjs/common';
  import Customer from '@app/entities/classes/customer.entity';
  import { CustomersService } from './costumers.service';
  
  @Controller('customers')
  export class CustomersController {
    constructor(
      private readonly customersService: CustomersService,
    ) {}
  
    @Get()
    async findAll(): Promise<Customer[]> {
      return this.customersService.findAll();
    }
  
    @Get('search')
    async findByName(@Query('name') name: string): Promise<Customer[]> {
      return this.customersService.findByName(name);
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Customer> {
      return this.customersService.findOne(id);
    }
  
    @Post()
    async create(@Body() createCustomerData: any): Promise<Customer> {
      return this.customersService.create(createCustomerData);
    }
  
    @Put(':id')
    async update(
      @Param('id') id: string,
      @Body() updateCustomerData: any
    ): Promise<Customer> {
      return this.customersService.update(id, updateCustomerData);
    }
  
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
      return this.customersService.delete(id);
    }
  }