import { Column, Entity, ManyToOne } from "typeorm";
import Generic from "./generic.entity";
import StoreInfo from "./store-info";

@Entity({ name: "store_policy" })
export class StorePolicy extends Generic {

    @Column({  type: "varchar", length: 36, nullable: false })
    title: string;

    @Column({ type: "text", nullable: false })
    content: string;

    @ManyToOne(() => StoreInfo, (storeInfo) => storeInfo.policies, { eager: true, onDelete: "CASCADE" })
    storeInfo: StoreInfo;
}
