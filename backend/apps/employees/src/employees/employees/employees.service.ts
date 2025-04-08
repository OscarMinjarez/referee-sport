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

  // Crear un empleado
  async create(employeeData: Partial<Employee>): Promise<Employee> {
    try {
      const employee = this.employeeRepository.create(employeeData);
      return await this.employeeRepository.save(employee);
    } catch (error: any) {
      throw new HttpException('Error al crear el empleado', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Consultar todos los empleados
  async findAll(): Promise<Employee[]> {
    try {
      return await this.employeeRepository.find();
    } catch (error: any) {
      throw new HttpException('Error al obtener los empleados', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Iniciar sesión
  async login(credentials: { username: string; password: string }): Promise<{ token: string; employee: Employee }> {
    try {
      const employee = await this.employeeRepository.findOne({
        where: { username: credentials.username },
      });

      if (!employee) {
        throw new HttpException('Empleado no encontrado', HttpStatus.NOT_FOUND);
      }

      // Comparación simple de contraseñas; en producción se debe usar hash y comparación segura
      if (employee.password !== credentials.password) {
        throw new HttpException('Credenciales incorrectas', HttpStatus.UNAUTHORIZED);
      }

      // Se retorna un token dummy para efectos del ejemplo
      return { token: 'dummy-token', employee };
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw new HttpException('Error al iniciar sesión', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}