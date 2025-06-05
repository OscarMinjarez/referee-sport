import { Controller, Get, Post, Body, HttpException, HttpStatus, UseGuards, Param } from '@nestjs/common';
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

  @Post(':uid')
  async findByUid(@Param('uid') uid: string): Promise<Employee> {
    try {
      return await this.employeesService.findByUid(uid);
    } catch (error: any) {
      throw new HttpException('Error al obtener el empleado', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}