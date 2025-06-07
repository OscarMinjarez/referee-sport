import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import Generic from "./generic.entity";
import Address from "./address.entity";
import { StorePolicy } from "./store-policy.entity";
import { ContactMessage } from "./contact-message.entity";

@Entity({ name: "store_info" })
export default class StoreInfo extends Generic {

    @Column({ type: "varchar", length: 100, nullable: false })
    storeName: string;

    @Column({ type: "text", nullable: false })
    about: string;

    @OneToOne(() => Address, { eager: true, cascade: true, onDelete: "CASCADE" })
    address: Address;

    @Column({ type: "varchar", length: 10, nullable: true })
    phoneNumber: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    email: string;

    @Column({ type: "varchar", length: 13, nullable: true })
    rfc: string;

    @Column({ type: "simple-json", nullable: true })
    socialMedia: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        youtube?: string;
        tiktok?: string;
        whatsapp?: string;
        telegram?: string;
        linkedin?: string;
    };

    @OneToMany(() => StorePolicy, (storePolicy) => storePolicy.storeInfo, { eager: true, cascade: true, onDelete: "CASCADE" })
    policies: StorePolicy[];

    @OneToMany(() => ContactMessage, (contactMessage) => contactMessage.storeInfo, { eager: true, cascade: true, onDelete: "CASCADE" })
    contactMessages: ContactMessage[];
}