import { Column } from "typeorm";
import Generic from "./generic.entity";

export default class User extends Generic {
    @Column({ type: "varchar", length: 50, nullable: false })
    username: string;

    @Column({ type: "varchar", length: 250, nullable: false })
    email: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    password: string;

    setUsername(username: string): void {
        this.username = username;
    }

    setEmail(email: string): void {
        this.email = email;
    }

    setPassword(password: string): void {
        this.password = password;
    }

    getUsername(): string {
        return this.username;
    }

    getEmail(): string {
        return this.email;
    }

    getPassword(): string {
        return this.password;
    }

    isValid(): boolean {
        return !!(this.username && this.email && this.password);
    }
}