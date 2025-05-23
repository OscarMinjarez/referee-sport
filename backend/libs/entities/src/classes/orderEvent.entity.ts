import { Column, Entity } from "typeorm";
import Generic from "./generic.entity";

export enum OrderEventValue {
    Purchased = 'purchased',
    Updated = 'updated',
    Canceled = 'canceled',
    Finished = 'finished',
    PaymentAdded = 'payment_added',
    PartialPayment = 'partial_payment',
    PaymentCompleted = 'payment_completed'
}

@Entity({ name: "orders_events" })
export default class OrderEvent extends Generic {
    @Column({ type: "enum", enum: OrderEventValue, nullable: false, default: OrderEventValue.Purchased })
    event: OrderEventValue;
}