import { Column } from "typeorm";
import Generic from "./generic.entity";

export enum SizeValue {
    Small = "s",
    Medium = "m",
    Large = "l",
    ExtraLarge = "xl",
    Other = "other"
};

export default class Size extends Generic {

    @Column({ type: "enum", enum: SizeValue, nullable: false })
    size: SizeValue;
}