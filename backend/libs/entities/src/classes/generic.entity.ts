import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export default class Generic {

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @CreateDateColumn({ type: "timestamptz", nullable: false})
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamptz", nullable: false })
    updatedAt: Date;
}