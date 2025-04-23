import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import Employee from '@app/entities/classes/employee.entity';
import { EmployeeTypeValue } from '@app/entities/classes/employeeType.entity'; // Asegúrate de que la ruta sea correcta

describe('EmployeesService', () => {
  let service: EmployeesService;
  let repository: any;

  const employeeArray = [
    { uuid: '1', username: 'john', email: 'john@example.com', password: '123', type: EmployeeTypeValue.Sales },
    { uuid: '2', username: 'jane', email: 'jane@example.com', password: '456', type: EmployeeTypeValue.Store },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: getRepositoryToken(Employee),
          useValue: {
            create: jest.fn((data) => data),
            save: jest.fn((employee) => Promise.resolve({ uuid: 'new-uuid', ...employee })),
            find: jest.fn(() => Promise.resolve(employeeArray)),
            findOne: jest.fn(({ where: { username } }) =>
              Promise.resolve(employeeArray.find(emp => emp.username === username)),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    repository = module.get(getRepositoryToken(Employee));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an employee', async () => {
    const result = await service.create({
      username: 'alice',
      email: 'alice@example.com',
      password: '789',
      type: EmployeeTypeValue.Clerk, // Usando el valor correcto del enum
    });
    expect(result).toHaveProperty('uuid');
    expect(result.username).toEqual('alice');
  });

  it('should find all employees', async () => {
    const result = await service.findAll();
    expect(result.length).toBe(2);
  });

  it('should login successfully', async () => {
    const result = await service.login({ username: 'john', password: '123' });
    expect(result).toHaveProperty('token');
    expect(result.employee.username).toEqual('john');
  });

  it('should throw error on wrong password', async () => {
    await expect(service.login({ username: 'john', password: 'wrong' })).rejects.toThrow();
  });
});