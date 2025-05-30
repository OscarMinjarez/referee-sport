import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import Generic from "./generic.entity";
import Product from "./product.entity";
import Variant from "./variant.entity";

@Entity({ name: "products_variants" })
export default class ProductVariant extends Generic {

    @Column({ type: "int", nullable: false, default: 0 })
    quantity: number;

    @ManyToOne(() => Product, product => product.productsVariants, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "product_id" })
    product: Product;

    @ManyToOne(() => Variant, variant => variant.productsVariants, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "variant_id" })
    variant: Variant;
}