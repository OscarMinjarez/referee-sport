import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '@app/entities/classes/user.entity';


//no puse nada de encriptacion
@Controller('user')
export class UserController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Post('register')
  async register(@Body() userData: Partial<User>): Promise<User> {
    try {
      const { username, email, password } = userData;
      if (!username || !email || !password) {
        throw new HttpException('Todos los campos son requeridos', HttpStatus.BAD_REQUEST);
      }

      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new HttpException('El usuario ya existe', HttpStatus.CONFLICT);
      }

      const newUser = this.userRepository.create({
        username,
        email,
        password, 
      });

      return await this.userRepository.save(newUser);
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Error al registrar el usuario',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(@Body() loginData: Partial<User>): Promise<{ message: string, user?: User }> {
    try {
      const { email, password } = loginData;
      if (!email || !password) {
        throw new HttpException('Email y contraseña son requeridos', HttpStatus.BAD_REQUEST);
      }

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      if (user.password !== password) {
        throw new HttpException('Credenciales incorrectas', HttpStatus.UNAUTHORIZED);
      }

      return { message: 'Login exitoso', user };
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Error al iniciar sesión',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}