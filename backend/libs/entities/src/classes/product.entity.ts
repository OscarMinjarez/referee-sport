import { Column, Entity, ManyToOne } from "typeorm";
import Generic from "./generic.entity";
import Size from "./size.entity";

@Entity({ name: "products" })
export default class Product extends Generic {
    
    @Column({ type: "varchar", length: 50, nullable: false })
    name: string;

    @Column({ type: "varchar", length: 250, nullable: false })
    description: string;

    @Column({ type: "int", nullable: false })
    stockQuantity: number;

    @Column({ type: "float", nullable: false })
    price: number;

    @Column({ type: "varchar", length: 250, nullable: true })
    imageUrl?: string;

    
    @Column({ type: "simple-array", nullable: true })
    tags: string[];
    
    @ManyToOne(() => Size, (size) => size.products)
    size: Size;
}