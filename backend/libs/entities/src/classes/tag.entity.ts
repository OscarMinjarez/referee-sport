import { Column, Entity, ManyToMany } from "typeorm";
import Generic from "./generic.entity";
import Product from "./product.entity";

@Entity({ name: "tags" })
export default class Tag extends Generic {
    @Column({ type: "varchar", length: 50, nullable: false, unique: true })
    name: string;

    @ManyToMany(() => Product, product => product.tags)
    products: Product[];
}