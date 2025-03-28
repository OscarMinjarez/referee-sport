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

    // Setters
    setNumberOrder(numberOrder: number): void {
        this.numberOrder = numberOrder;
    }

    setOrderItems(orderItems: OrderItem[]): void {
        this.orderItems = orderItems;
    }

    setTotal(total: number): void {
        this.total = total;
    }

    setDate(date: Date): void {
        this.date = date;
    }

    setPayments(payments: Payment[]): void {
        this.payments = payments;
    }

    setSpecifications(specifications: string): void {
        this.specifications = specifications;
    }

    setCustomer(customer: Customer): void {
        this.customer = customer;
    }

    setHistoryOrders(historyOrders: HistoryOrder[]): void {
        this.historyOrders = historyOrders;
    }

    // Getters
    getNumberOrder(): number {
        return this.numberOrder;
    }

    getOrderItems(): OrderItem[] {
        return this.orderItems;
    }

    getTotal(): number {
        return this.total;
    }

    getDate(): Date {
        return this.date;
    }

    getPayments(): Payment[] {
        return this.payments;
    }

    getSpecifications(): string {
        return this.specifications;
    }

    getCustomer(): Customer {
        return this.customer;
    }

    getHistoryOrders(): HistoryOrder[] {
        return this.historyOrders;
    }

    // pa despues
    cancelOrder(): void {
     
        console.log(`Canceling order #${this.numberOrder}`);
    }

    remainingAmount(): number {
        // sera
        const totalPaid = this.payments.reduce((sum, payment) => sum + payment.total, 0);
        return Math.max(this.total - totalPaid, 0);
    }

    calculateCost(): number {
        // pa calcular el costo total de la orden
        return this.orderItems.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);
    }
}