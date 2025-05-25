import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import Employee from '@app/entities/classes/employee.entity';
import { EmployeeTypeValue } from '@app/entities/classes/employeeType.entity';
import { FirebaseService } from '@app/firebase';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    private firebaseService: FirebaseService,
  ) {}

  async register(data: {
    username: string;
    email: string;
    password: string;
    type: 'sales' | 'store' | 'admin';
  }): Promise<{ message: string; employee: Omit<Employee, 'password'> }> {
    try {
      const existingEmployee = await this.employeeRepo.findOne({
        where: { email: data.email }
      });
      if (existingEmployee) {
        throw new HttpException('El email ya está registrado', HttpStatus.CONFLICT);
      }
      const existingUsername = await this.employeeRepo.findOne({
        where: { username: data.username }
      });
      if (existingUsername) {
        throw new HttpException('El username ya está en uso', HttpStatus.CONFLICT);
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);
      let employeeType: EmployeeTypeValue;
      switch (data.type) {
        case 'sales':
          employeeType = EmployeeTypeValue.Sales;
          break;
        case 'store':
          employeeType = EmployeeTypeValue.Store;
          break;
        case 'admin':
          employeeType = EmployeeTypeValue.Admin;
          break;
        default:
          throw new HttpException('Tipo de empleado inválido', HttpStatus.BAD_REQUEST);
      }
      const userRecord = await this.firebaseService.register(
        data.email,
        data.password,
        data.username
      );
      const employee = this.employeeRepo.create({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        type: employeeType,
        uid: userRecord.uid,
      });
      const savedEmployee = await this.employeeRepo.save(employee);
      const { password, ...employeeWithoutPassword } = savedEmployee;
      return {
        message: 'Empleado registrado exitosamente',
        employee: employeeWithoutPassword,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al registrar empleado:', error);
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ message: string; employee: Omit<Employee, 'password'>, token: string }> {
    try {
      const employee = await this.employeeRepo.findOne({
        where: { email: data.email }
      });
      if (!employee) {
        throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
      }
      const isPasswordValid = await bcrypt.compare(data.password, employee.password);
      if (!isPasswordValid) {
        throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
      }
      const { password, ...employeeWithoutPassword } = employee;
      const customToken = await this.firebaseService.createCustomToken(employee.uid);
      return {
        message: 'Inicio de sesión exitoso',
        employee: employeeWithoutPassword,
        token: customToken,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al iniciar sesión:', error);
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.employeeRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Employee | null> {
    const employee = await this.employeeRepo.findOne({ where: { uuid: id } });
    if (!employee) {
      return null;
    }
    const { password, ...employeeWithoutPassword } = employee;
    return employeeWithoutPassword as Employee;
  }
}