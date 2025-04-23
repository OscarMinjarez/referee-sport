import { Column, Entity } from "typeorm";
import Generic from "./generic.entity";

export enum OrderEventValue {
    Purchased = "purchased",
    Updated = "updated", 
    Deleted = "deleted",
    Finished = "finished"
}

@Entity({ name: "orders_events" })
export default class OrderEvent extends Generic {
    @Column({ type: "enum", enum: OrderEventValue, nullable: false, default: OrderEventValue.Purchased })
    event: OrderEventValue;
}