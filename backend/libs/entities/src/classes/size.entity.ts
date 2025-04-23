import { Column, Entity, OneToMany } from "typeorm";
import Generic from "./generic.entity";
import Variant from "./variant.entity";

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

    @OneToMany(() => Variant, (variant) => variant.size)
    variants: Variant[];
}