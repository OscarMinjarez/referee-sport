import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import Employee from '@app/entities/classes/employee.entity';

@Controller('employees')
export class EmployeesController {

  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async findAll(): Promise<Employee[]> {
    try {
      return await this.employeesService.findAll();
    } catch (error: any) {
      throw new HttpException('Error al obtener los empleados', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}