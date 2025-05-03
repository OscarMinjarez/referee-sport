import { Column, Entity, OneToMany, ManyToMany, JoinTable } from "typeorm";
import Generic from "./generic.entity";
import Variant from "./variant.entity";
import Tag from "./tag.entity";

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
    
    @ManyToMany(() => Tag, tag => tag.products, { cascade: true, eager: true })
    @JoinTable({
      name: "product_tags",
      joinColumn: { name: "product_id", referencedColumnName: "uuid" },
      inverseJoinColumn: { name: "tag_id", referencedColumnName: "uuid" },
    })
    tags: Tag[];
    
    @OneToMany(() => Variant, (variant) => variant.product, { cascade: true })
    variants: Variant[];
}