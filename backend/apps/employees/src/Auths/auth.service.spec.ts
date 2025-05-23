import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthModule } from './auth.module';
import { EntitiesService } from '@app/entities/entities.service';
import { DataSource } from 'typeorm';
import Employee from '@app/entities/classes/employee.entity';
import { EmployeeTypeValue } from '@app/entities/classes/employeeType.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService (Integration)', () => {
  let service: AuthService;
  let dataSource: DataSource;
  let createdEmployeeId: string;

  beforeAll(async () => {
    console.log('Inicializando módulo de pruebas de autenticación...');
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({ useClass: EntitiesService }),
        AuthModule,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    dataSource = module.get<DataSource>(DataSource);
    console.log('Conexión a base de datos:', dataSource.isInitialized ? '✔︎ Inicializada' : '✘ Fallo');

    await dataSource.synchronize(true);
    console.log('Esquema sincronizado en la base de datos.');
  });

  afterAll(async () => {
    console.log('Cerrando conexión...');
    await dataSource.destroy();
    console.log('Conexión cerrada.');
  });

  it('registrar un empleado de ventas exitosamente', async () => {
    const registerData = {
      username: 'vendedor1',
      email: 'vendedor@test.com',
      password: 'password123',
      type: 'sales' as const,
    };

    const result = await service.register(registerData);
    createdEmployeeId = result.employee.uuid;

    console.log('Empleado registrado:', result);

    expect(result.message).toBe('Empleado registrado exitosamente');
    expect(result.employee.username).toBe('vendedor1');
    expect(result.employee.email).toBe('vendedor@test.com');
    expect(result.employee.type).toBe(EmployeeTypeValue.Sales);
    expect(result.employee).not.toHaveProperty('password');
  });

  it('no permitir registrar empleado con email duplicado', async () => {
    const duplicateData = {
      username: 'vendedor2',
      email: 'vendedor@test.com', // mismo email
      password: 'password123',
      type: 'store' as const,
    };

    await expect(service.register(duplicateData)).rejects.toThrow('El email ya está registrado');
  });

  it('no permitir registrar empleado con username duplicado', async () => {
    const duplicateData = {
      username: 'vendedor1', // mismo username
      email: 'otro@test.com',
      password: 'password123',
      type: 'clerk' as const,
    };

    await expect(service.register(duplicateData)).rejects.toThrow('El username ya está en uso');
  });

  it('registrar empleado de almacén (store)', async () => {
    const storeEmployeeData = {
      username: 'almacenista1',
      email: 'almacen@test.com',
      password: 'store123',
      type: 'store' as const,
    };

    const result = await service.register(storeEmployeeData);

    expect(result.employee.type).toBe(EmployeeTypeValue.Store);
    expect(result.employee.username).toBe('almacenista1');
  });

  it('registrar empleado admin (clerk)', async () => {
    const adminData = {
      username: 'admin1',
      email: 'admin@test.com',
      password: 'admin123',
      type: 'clerk' as const,
    };

    const result = await service.register(adminData);

    expect(result.employee.type).toBe(EmployeeTypeValue.Clerk);
    expect(result.employee.username).toBe('admin1');
  });

  it('iniciar sesión con credenciales correctas', async () => {
    const loginData = {
      email: 'vendedor@test.com',
      password: 'password123',
    };

    const result = await service.login(loginData);

    console.log('Login exitoso:', result);

    expect(result.message).toBe('Inicio de sesión exitoso');
    expect(result.employee.email).toBe('vendedor@test.com');
    expect(result.employee.type).toBe(EmployeeTypeValue.Sales);
    expect(result.employee).not.toHaveProperty('password');
  });

  it('no permitir login con email incorrecto', async () => {
    const wrongEmailData = {
      email: 'noexiste@test.com',
      password: 'password123',
    };

    await expect(service.login(wrongEmailData)).rejects.toThrow('Credenciales inválidas');
  });

  it('no permitir login con contraseña incorrecta', async () => {
    const wrongPasswordData = {
      email: 'vendedor@test.com',
      password: 'wrongpassword',
    };

    await expect(service.login(wrongPasswordData)).rejects.toThrow('Credenciales inválidas');
  });

  it('verificar que la contraseña se hashea correctamente', async () => {
    const empRepo = dataSource.getRepository(Employee);
    const employee = await empRepo.findOne({ where: { email: 'vendedor@test.com' } });
    
    expect(employee).toBeTruthy();
    expect(employee!.password).not.toBe('password123'); // Debe estar hasheada
    
    // Verificar que el hash es válido
    const isValidHash = await bcrypt.compare('password123', employee!.password);
    expect(isValidHash).toBe(true);
  });

  it('buscar empleado por email', async () => {
    const found = await service.findByEmail('vendedor@test.com');
    
    expect(found).toBeTruthy();
    expect(found!.username).toBe('vendedor1');
    expect(found!.type).toBe(EmployeeTypeValue.Sales);
  });

  it('buscar empleado por ID', async () => {
    const found = await service.findById(createdEmployeeId);
    
    expect(found).toBeTruthy();
    expect(found!.username).toBe('vendedor1');
    expect(found).not.toHaveProperty('password'); // No debe incluir la contraseña
  });

  it('retornar null al buscar empleado inexistente por email', async () => {
    const notFound = await service.findByEmail('noexiste@test.com');
    expect(notFound).toBeNull();
  });

  it('validar todos los tipos de empleado', async () => {
    const employees = [
      { username: 'test1', email: 'test1@test.com', type: 'sales' as const, expected: EmployeeTypeValue.Sales },
      { username: 'test2', email: 'test2@test.com', type: 'store' as const, expected: EmployeeTypeValue.Store },
      { username: 'test3', email: 'test3@test.com', type: 'clerk' as const, expected: EmployeeTypeValue.Clerk },
    ];

    for (const emp of employees) {
      const result = await service.register({
        ...emp,
        password: 'test123',
      });
      
      expect(result.employee.type).toBe(emp.expected);
      console.log(`Empleado ${emp.type} creado correctamente:`, result.employee.username);
    }
  });
});