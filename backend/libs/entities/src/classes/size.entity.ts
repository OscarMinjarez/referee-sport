import { Column, Entity, ManyToOne } from "typeorm";
import Generic from "./generic.entity";
import Product from "./product.entity";

export enum SizeValue {
    Small = "s",
    Medium = "m",
    Large = "l",
    ExtraLarge = "xl",
    Other = "other"
};

@Entity({ name: "sizes" })
export default class Size extends Generic {

    @Column({ type: "enum", enum: SizeValue, nullable: false })
    size: SizeValue;

    @ManyToOne(() => Product, (product) => product.size)
    products: Product[];
}