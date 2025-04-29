import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import {ProductsModule} from "./products/products.module";
import {UserModule} from "./user/user.module";
import {EmployeesModule as Employees} from "./employees/employees.module";
import {SizeModule} from "./size/size.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {EntitiesService} from "@app/entities";
import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './costumers/costumer.module';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useClass: EntitiesService,
        }),
        ProductsModule, UserModule, Employees, SizeModule, OrdersModule, CustomersModule
    ],
    controllers: [EmployeesController],
    providers: [EmployeesService],
})
export class EmployeesModule {}
