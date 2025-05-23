import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import Employee from '@app/entities/classes/employee.entity';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  async register(@Body() body: {
    username: string;
    email: string;
    password: string;
    type: 'sales' | 'store' | 'clerk';
  }): Promise<{ message: string; employee: Omit<Employee, 'password'> }> {
    return this.service.register(body);
  }

  @Post('login')
  async login(@Body() body: {
    email: string;
    password: string;
  }): Promise<{ message: string; employee: Omit<Employee, 'password'> }> {
    return this.service.login(body);
  }
}