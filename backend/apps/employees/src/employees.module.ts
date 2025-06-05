import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import {ProductsModule} from "./products/products.module";
import {EmployeesModule as Employees} from "./employees/employees.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {EntitiesService} from "@app/entities";
import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './costumers/costumer.module';
import { PaymentsModule } from './payments/payments.module';
import { AuthModule } from './auths/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseAuthGuard } from './auths/guards/firebase-auth.guard';
import { FirebaseModule } from '@app/firebase';
import { RolesGuard } from './auths/guards/roles.guard';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useClass: EntitiesService,
        }),
        ProductsModule, Employees, OrdersModule, CustomersModule, PaymentsModule, AuthModule, FirebaseModule
    ],
    controllers: [EmployeesController],
    providers: [
        EmployeesService,
        {
            provide: APP_GUARD,
            useClass: FirebaseAuthGuard
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard
        }
    ],
})
export class EmployeesModule {}
