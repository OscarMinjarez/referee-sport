import { Column, Entity } from "typeorm";
import User from "./user.entity";
import { EmployeeTypeValue } from "./employeeType.entity";

@Entity({ name: "employees" })
export default class Employee extends User {
    @Column({ type: "enum", enum: EmployeeTypeValue, nullable: false })
    type: EmployeeTypeValue;
}