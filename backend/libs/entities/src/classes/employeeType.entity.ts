import { Column } from "typeorm";
import Generic from "./generic.entity";

export enum EmployeeTypeValue {
    Sales = "sales",
    Store = "store",
    Clerk = "clerk"
}

export default class EmployeeType extends Generic {
    @Column({ type: "enum", enum: EmployeeTypeValue, nullable: false })
    type: EmployeeTypeValue;
}