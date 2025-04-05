import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { EntitiesModule } from '@app/entities';
import { ProductsModule } from './products/products.module';
import { SizeModule } from './size/size.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    EntitiesModule,
    ProductsModule,
    SizeModule,
    UserModule
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
