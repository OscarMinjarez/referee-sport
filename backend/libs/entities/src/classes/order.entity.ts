import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import Generic from "./generic.entity";
import OrderItem from "./orderItem.entity";
import Payment from "./payment.entity";
import Customer from "./customer.entity";
import HistoryOrder from "./historyOrder.entity";

@Entity()
export default class Order extends Generic {
    @Column({ type: "int", nullable: false, unique: true })
    numberOrder: number;

    @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true, eager: true })
    orderItems: OrderItem[];

    @Column({ type: "float", nullable: false })
    total: number;

    @Column({ type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
    date: Date;

    @OneToMany(() => Payment, payment => payment.order, { cascade: true, eager: true })
    payments: Payment[];

    @Column({ type: "text", nullable: true })
    specifications: string;

    @ManyToOne(() => Customer, customer => customer.orders, { nullable: false })
    @JoinColumn({ name: "customer_id" })
    customer: Customer;

    @OneToMany(() => HistoryOrder, historyOrder => historyOrder.order, { cascade: true, eager: true })
    historyOrders: HistoryOrder[];
}