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
}