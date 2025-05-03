import { Test, TestingModule } from '@nestjs/testing'; 
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees/employees.service';
import Employee from '@app/entities/classes/employee.entity';
import { EmployeeTypeValue } from '@app/entities/classes/employeeType.entity'; // Asegúrate de que la ruta sea correcta

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let service: EmployeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: {
            create: jest.fn((data) => Promise.resolve({ uuid: 'some-uuid', ...data })),
            findAll: jest.fn(() =>
              Promise.resolve([
                { uuid: 'some-uuid', username: 'test', email: 'test@example.com', password: '123', type: EmployeeTypeValue.Sales },
              ]),
            ),
            login: jest.fn(({ username, password }) =>
              Promise.resolve({
                token: 'dummy-token',
                employee: { uuid: 'some-uuid', username, email: 'test@example.com', password, type: EmployeeTypeValue.Sales },
              }),
            ),
          },
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an employee', async () => {
    // Se utiliza EmployeeTypeValue.Sales en lugar de 'manager'
    const result = await controller.create({
      username: 'john',
      email: 'john@example.com',
      password: '123',
      type: EmployeeTypeValue.Sales,
    });
    expect(result).toHaveProperty('uuid');
    expect(result.username).toEqual('john');
  });

  it('should get all employees', async () => {
    const result = await controller.findAll();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should login an employee', async () => {
    const result = await controller.login({ username: 'john', password: '123' });
    expect(result).toHaveProperty('token');
    expect(result.employee.username).toEqual('john');
  });
});