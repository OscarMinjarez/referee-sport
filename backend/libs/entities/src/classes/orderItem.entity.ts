import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import Generic from "./generic.entity";
import Product from "./product.entity";
import Order from "./order.entity";

@Entity({ name: "orders_items" })
export default class OrderItem extends Generic {
  @ManyToOne(() => Order, order => order.orderItems, { nullable: false, onDelete: "CASCADE"  })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ type: "int", nullable: false })
  quantity: number;

  @Column({ type: "float", nullable: false })
  totalPrice: number;
}