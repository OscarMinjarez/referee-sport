import { Column } from "typeorm";
import Generic from "./generic.entity";

export enum OrderEventValue {
    Purchased = "purchased",
    Updated = "updated", 
    Deleted = "deleted",
    Finished = "finished"
}

export default class OrderEvent extends Generic {
    @Column({ type: "enum", enum: OrderEventValue, nullable: false })
    event: OrderEventValue;
}