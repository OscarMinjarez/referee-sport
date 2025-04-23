import { Column, Entity, ManyToOne } from "typeorm";
import Generic from "./generic.entity";
import Size from "./size.entity";
import Product from "./product.entity";

@Entity({ name: "variants" })
export default class Variant extends Generic {
    @Column({ type: "int", nullable: false, default: 0 })
    quantity: number;
    
    @ManyToOne(() => Size, (size) => size.variants)
    size: Size;

    @ManyToOne(() => Product, (product) => product.variants)
    product: Product;
}