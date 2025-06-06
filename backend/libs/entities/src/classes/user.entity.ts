import { Column } from "typeorm";
import Generic from "./generic.entity";

export default class User extends Generic {
    @Column({ type: "varchar", length: 50, nullable: false })
    username: string;

    @Column({ type: "varchar", length: 250, nullable: false })
    email: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    password: string;

    @Column({ type: "varchar", nullable: true })
    uid: string;

    @Column({ type: "varchar", nullable: true })
    imagePath: string;
}