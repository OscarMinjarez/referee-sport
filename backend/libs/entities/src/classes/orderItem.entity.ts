import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import Generic from "./generic.entity";
import Product from "./product.entity";

@Entity()
export default class OrderItem extends Generic {
    @ManyToOne(() => Product, { nullable: false })
    @JoinColumn({ name: "product_id" })
    product: Product;

    @Column({ type: "int", nullable: false })
    quantity: number;

    @Column({ type: "float", nullable: false })
    totalPrice: number;

    setProduct(product: Product): void {
        this.product = product;
    }

    setQuantity(quantity: number): void {
        this.quantity = quantity;
    }

    setTotalPrice(totalPrice: number): void {
        this.totalPrice = totalPrice;
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

    // por mienttas
    calculateTotalPrice(): number {
        if (this.product && this.quantity) {
            return this.product.price * this.quantity;
        }
        return 0;
    }
}