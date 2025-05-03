
import { Column, Entity, OneToMany, OneToOne, JoinColumn } from "typeorm";
import Generic from "./generic.entity";
import Address from "./address.entity";
import Order from "./order.entity";

@Entity({ name: "customers"})
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
}