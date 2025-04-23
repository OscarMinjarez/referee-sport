import { Column, Entity, OneToMany } from "typeorm";
import Generic from "./generic.entity";
import Variant from "./variant.entity";

@Entity({ name: "products" })
export default class Product extends Generic {
    @Column({ type: "varchar", length: 50, nullable: false })
    name: string;

    @Column({ type: "varchar", length: 250, nullable: false })
    description: string;

    @Column({ type: "float", nullable: false })
    price: number;

    @Column({ type: "varchar", length: 250, nullable: true })
    imageUrl?: string;
    
    @Column({ type: "simple-array", nullable: true })
    tags: string[];
    
    @OneToMany(() => Variant, (variant) => variant.product, { cascade: true })
    variants: Variant[];
}