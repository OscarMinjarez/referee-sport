import { Column, Entity, ManyToOne } from "typeorm";
import Generic from "./generic.entity";
import StoreInfo from "./store-info";

@Entity({  name: "contact_message" })
export class ContactMessage extends Generic {

    @Column({  type: "varchar", length: 100, nullable: false })
    name: string;

    @Column({ type: "varchar", length: 10, nullable: false })
    phoneNumber: string;

    @Column({ type: "varchar", length: 100, nullable: false })
    email: string;

    @Column({ type: "text" })
    message: string;

    @ManyToOne(() => StoreInfo, (storeInfo) => storeInfo.contactMessages, { eager: true, onDelete: "CASCADE" })
    storeInfo: StoreInfo;
}
