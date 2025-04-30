import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import Customer from '@app/entities/classes/customer.entity';
import Address from '@app/entities/classes/address.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,

    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({
      relations: ['addresses', 'orders'],
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { uuid: id },
      relations: ['addresses', 'orders'],
    });
    if (!customer) {
      throw new HttpException('Cliente no encontrado', HttpStatus.NOT_FOUND);
    }
    return customer;
  }

  async findByName(name: string): Promise<Customer[]> {
    try {
      return this.customerRepository.find({
        where: [
          { name: ILike(`%${name}%`) },
          { lastName: ILike(`%${name}%`) },
        ],
        relations: ['addresses', 'orders'],
      });
    } catch {
      throw new HttpException(
        'Error al buscar clientes por nombre',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(customerData: any): Promise<Customer> {
    try {
      let savedAddress: Address | undefined;

      if (customerData.address) {
        // 1) Creamos la entidad Address
        const addressEntity = this.addressRepository.create(customerData.address);
        // 2) La guardamos y nos aseguramos de “desenvolver” el array
        const result = await this.addressRepository.save(addressEntity);
        savedAddress = Array.isArray(result) ? result[0] : result;
      }

      // Creamos el cliente
      const customer = this.customerRepository.create({
        name: customerData.name,
        lastName: customerData.lastName,
        phoneNumber: customerData.phoneNumber,
        addresses: savedAddress,
      });

      return await this.customerRepository.save(customer);
    } catch (error) {
      throw new HttpException(
        'Error al crear el cliente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, customerData: any): Promise<Customer> {
    try {
      const customer = await this.findOne(id);

      // Campos básicos
      if (customerData.name)        customer.name = customerData.name;
      if (customerData.lastName)    customer.lastName = customerData.lastName;
      if (customerData.phoneNumber) customer.phoneNumber = customerData.phoneNumber;

      // Dirección
      if (customerData.address) {
        if (customer.addresses) {
          // Actualizar existente
          Object.assign(customer.addresses, customerData.address);
          const saved = await this.addressRepository.save(customer.addresses);
          // lo desenvolvemos igual que en create (por si devolviera array)
          customer.addresses = Array.isArray(saved) ? saved[0] : saved;
        } else {
          // Crear nueva
          const newAddr = this.addressRepository.create(customerData.address);
          const saved = await this.addressRepository.save(newAddr);
          customer.addresses = Array.isArray(saved) ? saved[0] : saved;
        }
      }

      return await this.customerRepository.save(customer);
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Error al actualizar el cliente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      const customer = await this.findOne(id);
      // al hacer remove sobre el customer, se borrará la dirección por cascada
      await this.customerRepository.remove(customer);
      return { message: 'Cliente eliminado correctamente' };
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Error al eliminar el cliente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  
  }
}