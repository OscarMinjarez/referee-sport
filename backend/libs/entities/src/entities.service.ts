import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import Product from './classes/product.entity';
import Address from './classes/address.entity';
import Customer from './classes/customer.entity';
import Employee from './classes/employee.entity';
import Order from './classes/order.entity';
import Payment from './classes/payment.entity';
import Size from './classes/size.entity';
import User from './classes/user.entity';
import OrderItem from './classes/orderItem.entity';
import HistoryOrder from './classes/historyOrder.entity';
import OrderEvent from './classes/orderEvent.entity';
import Variant from './classes/variant.entity';
import Tag from './classes/tag.entity';

@Injectable()
export class EntitiesService implements TypeOrmOptionsFactory {

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: 'localhost',
            port: 3000,
            username: 'postgres',
            password: '1234',
            database: 'referee_sport',
            synchronize: true,
            entities: [
                Product, Address, Customer, Employee, Order,
                Payment, Variant,Size, User, OrderItem, HistoryOrder,
                OrderEvent,Tag,
            ],
        };
    }
}
