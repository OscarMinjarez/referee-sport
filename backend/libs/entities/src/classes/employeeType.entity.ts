import { Column, Entity } from "typeorm";
import Generic from "./generic.entity";

export enum EmployeeTypeValue {
    Sales = "sales",
    Store = "store",
    Clerk = "clerk"
}

@Entity({ name: "employees_types" })
export default class EmployeeType extends Generic {
    @Column({ type: "enum", enum: EmployeeTypeValue, nullable: false })
    type: EmployeeTypeValue;
}