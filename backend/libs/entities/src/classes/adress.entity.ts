import { Column, Entity } from "typeorm";
import Generic from "./generic.entity";

@Entity()
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

    // Setters
    setStreetName(streetName: string): void {
        this.streetName = streetName;
    }

    setNumber(number: string): void {
        this.number = number;
    }

    setZipCode(zipCode: string): void {
        this.zipCode = zipCode;
    }

    setNeighborhood(neighborhood: string): void {
        this.neighborhood = neighborhood;
    }

    setCity(city: string): void {
        this.city = city;
    }

    setState(state: string): void {
        this.state = state;
    }

    // Getters
    getStreetName(): string {
        return this.streetName;
    }

    getNumber(): string {
        return this.number;
    }

    getZipCode(): string {
        return this.zipCode;
    }

    getNeighborhood(): string {
        return this.neighborhood;
    }

    getCity(): string {
        return this.city;
    }

    getState(): string {
        return this.state;
    }
}