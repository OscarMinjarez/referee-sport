import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Employee from '@app/entities/classes/employee.entity';

@Injectable()
export class EmployeesService {

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async findAll(): Promise<Employee[]> {
    try {
      return await this.employeeRepository.find();
    } catch (error: any) {
      throw new HttpException('Error al obtener los empleados', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}