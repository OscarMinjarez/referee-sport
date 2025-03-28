
import { Column, Entity, OneToMany, OneToOne, JoinColumn } from "typeorm";
import Generic from "./generic.entity";
import Address from "./adress.entity";
import Order from "./order.entity";

@Entity()
export default class Customer extends Generic {
    @Column({ type: "varchar", length: 100, nullable: false })
    name: string;

    @Column({ type: "varchar", length: 100, nullable: false })
    lastName: string;

    @Column({ type: "varchar", length: 20, nullable: false })
    phoneNumber: string;

    @OneToOne(() => Address, { nullable: true, cascade: true })
    @JoinColumn()
    addresses: Address;

    @OneToMany(() => Order, order => order.customer, { nullable: true })
    orders: Order[];

    setName(name: string): void {
        this.name = name;
    }

    setLastName(lastName: string): void {
        this.lastName = lastName;
    }

    setPhoneNumber(phoneNumber: string): void {
        this.phoneNumber = phoneNumber;
    }

    setAddresses(address: Address): void {
        this.addresses = address;
    }

    setCustomerOrders(orders: Order[]): void {
        this.orders = orders;
    }

    getName(): string {
        return this.name;
    }

    getLastName(): string {
        return this.lastName;
    }

    getPhoneNumber(): string {
        return this.phoneNumber;
    }

    getAddresses(): Address {
        return this.addresses;
    }

    getCustomerOrders(): Order[] {
        return this.orders;
    }
}