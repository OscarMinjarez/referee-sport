import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import Employee from '@app/entities/classes/employee.entity';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // Endpoint para crear un empleado
  @Post()
  async create(@Body() employeeData: Partial<Employee>): Promise<Employee> {
    try {
      return await this.employeesService.create(employeeData);
    } catch (error: any) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint para obtener todos los empleados
  @Get()
  async findAll(): Promise<Employee[]> {
    try {
      return await this.employeesService.findAll();
    } catch (error: any) {
      throw new HttpException('Error al obtener los empleados', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint para iniciar sesión
  @Post('login')
  async login(@Body() credentials: { username: string; password: string }): Promise<{ token: string; employee: Employee }> {
    try {
      return await this.employeesService.login(credentials);
    } catch (error: any) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}