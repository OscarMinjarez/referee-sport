import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import Generic from "./generic.entity";
import Order from "./order.entity"; // Assuming you have an Order entity

@Entity()
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

    setOrder(order: Order): void {
        this.order = order;
    }

    setTotal(total: number): void {
        this.total = total;
    }

    setState(state: boolean): void {
        this.paymentState = state;
    }

    setPaymentState(paymentState: boolean): void {
        this.paymentState = paymentState;
    }

    setDate(date: Date): void {
        this.date = date;
    }

    getOrder(): Order {
        return this.order;
    }

    getTotal(): number {
        return this.total;
    }

    getPaymentState(): boolean {
        return this.paymentState;
    }

    getDate(): Date {
        return this.date;
    }
}