import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Employee from '@app/entities/classes/employee.entity';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { FirebaseModule } from '@app/firebase';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    FirebaseModule
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}