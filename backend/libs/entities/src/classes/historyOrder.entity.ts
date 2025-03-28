
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import Generic from "./generic.entity";
import Employee from "./employee.entity";
import OrderEvent, { OrderEventValue } from "./orderEvent.entity";

@Entity()
export default class HistoryOrder extends Generic {
    @ManyToOne(() => Employee, { nullable: false })
    @JoinColumn({ name: "employee_id" })
    employee: Employee;

    @ManyToOne(() => OrderEvent, { nullable: false })
    @JoinColumn({ name: "order_event_id" })
    event: OrderEvent;

    @Column({ type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
    date: Date;

    setEmployee(employee: Employee): void {
        this.employee = employee;
    }

    setEvent(event: OrderEvent): void {
        this.event = event;
    }

    setDate(date: Date): void {
        this.date = date;
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

    // aun nel
    showHistoryOrder(): void {
        console.log();
    }
}