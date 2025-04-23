
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './costumers.controller';
import { CustomersService } from './costumers.service';
import Customer from '@app/entities/classes/customer.entity';
import Address from '@app/entities/classes/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Address]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService] // Export service to use in other modules
})
export class CustomersModule {}