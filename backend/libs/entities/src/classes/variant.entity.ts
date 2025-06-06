import { Column, Entity, OneToMany } from "typeorm";
import Generic from "./generic.entity";
import ProductVariant from "./productVariant.entity";

@Entity({ name: "variants" })
export default class Variant extends Generic {
    @Column({ type: "varchar", nullable: true })
    type: string;

    @Column({ type: "varchar", nullable: true })
    value: string;

    @OneToMany(() => ProductVariant, (productVariant) => productVariant.variant, {
        cascade: true
    })
    productsVariants: ProductVariant[];
}