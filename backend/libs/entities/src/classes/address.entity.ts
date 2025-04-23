import { Column, Entity } from "typeorm";
import Generic from "./generic.entity";

@Entity({ name: "addresses" })
export default class Address extends Generic {
    @Column({ type: "varchar", length: 255, nullable: false })
    streetName: string;

    @Column({ type: "varchar", length: 50, nullable: false })
    number: string;

    @Column({ type: "varchar", length: 20, nullable: false })
    zipCode: string;

    @Column({ type: "varchar", length: 100, nullable: false })
    neighborhood: string;

    @Column({ type: "varchar", length: 100, nullable: false })
    city: string;

    @Column({ type: "varchar", length: 100, nullable: false })
    state: string;
}