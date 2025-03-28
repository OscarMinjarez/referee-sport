import { Column, Entity } from "typeorm";
import User from "./user.entity";
import EmployeeType, { EmployeeTypeValue } from "./employeeType.entity";

@Entity()
export default class Employee extends User {
    @Column({ type: "simple-json", nullable: false })
    type: EmployeeType;
}