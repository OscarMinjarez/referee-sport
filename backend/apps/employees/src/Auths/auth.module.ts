import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Employee from '@app/entities/classes/employee.entity';
import EmployeeType from '@app/entities/classes/employeeType.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      EmployeeType,
    ]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService], // Por si necesitas usar el servicio en otros módulos
})
export class AuthModule {}