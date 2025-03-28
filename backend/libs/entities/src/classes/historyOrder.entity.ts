import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import Generic from "./generic.entity";
import Employee from "./employee.entity";
import OrderEvent from "./orderEvent.entity";
import Order from "./order.entity";

@Entity()
export default class HistoryOrder extends Generic {
  @ManyToOne(() => Order, order => order.historyOrders, { nullable: false })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToOne(() => Employee, { nullable: false })
  @JoinColumn({ name: "employee_id" })
  employee: Employee;

  @ManyToOne(() => OrderEvent, { nullable: false })
  @JoinColumn({ name: "order_event_id" })
  event: OrderEvent;

  @Column({ type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
  date: Date;

  setOrder(order: Order): void {
    this.order = order;
  }

  setEmployee(employee: Employee): void {
    this.employee = employee;
  }

  setEvent(event: OrderEvent): void {
    this.event = event;
  }

  setDate(date: Date): void {
    this.date = date;
  }

  // Getters
  getOrder(): Order {
    return this.order;
  }

  getEmployee(): Employee {
    return this.employee;
  }

  getEvent(): OrderEvent {
    return this.event;
  }

  getDate(): Date {
    return this.date;
  }

  showHistoryOrder(): void {
    console.log(`Historial: [${this.date}] - ${this.event} por ${this.employee}`);
  }
}