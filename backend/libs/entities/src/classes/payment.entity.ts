import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import Generic from "./generic.entity";
import Order from "./order.entity";

export enum PaymentState {
    Pending   = "pending",
    Completed = "completed",
    Canceled  = "canceled",
    Adjusted  = "adjusted"
}

@Entity({ name: "payments" })
export default class Payment extends Generic {
    @ManyToOne(() => Order, order => order.payments, { nullable: false })
    @JoinColumn({ name: "order_id" })
    order: Order;

    @Column({ type: "float", nullable: false })
    total: number;

    @Column({ 
        type: "enum", 
        enum: PaymentState,
        default: PaymentState.Pending,
        nullable: false 
    })
    state: PaymentState;

    @Column({ type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
    date: Date;
}