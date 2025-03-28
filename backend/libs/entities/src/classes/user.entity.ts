import { Column, Entity } from "typeorm";
import Generic from "./generic.entity";

@Entity({ name: "users" })
export default class User extends Generic {
    @Column({ type: "varchar", length: 50, nullable: false })
    username: string;

    @Column({ type: "varchar", length: 250, nullable: false })
    email: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    password: string;
}