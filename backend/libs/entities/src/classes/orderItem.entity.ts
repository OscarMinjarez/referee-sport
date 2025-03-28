import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import Generic from "./generic.entity";
import Product from "./product.entity";
import Order from "./order.entity";

@Entity()
export default class OrderItem extends Generic {
  @ManyToOne(() => Order, order => order.orderItems, { nullable: false })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ type: "int", nullable: false })
  quantity: number;

  @Column({ type: "float", nullable: false })
  totalPrice: number;

  // Setters
  setOrder(order: Order): void {
    this.order = order;
  }

  setProduct(product: Product): void {
    this.product = product;
  }

  setQuantity(quantity: number): void {
    this.quantity = quantity;
  }

  setTotalPrice(totalPrice: number): void {
    this.totalPrice = totalPrice;
  }

  // Getters
  getOrder(): Order {
    return this.order;
  }

  getProduct(): Product {
    return this.product;
  }

  getQuantity(): number {
    return this.quantity;
  }

  getTotalPrice(): number {
    return this.totalPrice;
  }

  // pal total
  calculateTotalPrice(): number {
    if (this.product && this.quantity) {
      return this.product.price * this.quantity;
    }
    return 0;
  }
}