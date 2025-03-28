import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import Generic from "./generic.entity";
import Order from "./order.entity"; // Assuming you have an Order entity

@Entity({ name: "payments" })
export default class Payment extends Generic {
    @ManyToOne(() => Order, order => order.payments, { nullable: false })
    @JoinColumn({ name: "order_id" })
    order: Order;

    @Column({ type: "float", nullable: false })
    total: number;

    @Column({ type: "boolean", default: false })
    paymentState: boolean;

    @Column({ type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
    date: Date;
}