import { Column } from "typeorm";
import Generic from "./generic.entity";

export default class Product extends Generic {

    @Column({ type: "varchar", length: 50, nullable: false })
    name: string;

    @Column({ type: "varchar", length: 250, nullable: false })
    description: string;

    @Column({ type: "int", nullable: false })
    stockQuantity: string;

    @Column({ type: "double", nullable: false })
    price: number;
}