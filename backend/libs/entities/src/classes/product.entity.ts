import { Column } from "typeorm";
import Generic from "./generic.entity";

export default class Product extends Generic {
    @Column({ type: "varchar", length: 50, nullable: false })
    name: string;

    @Column({ type: "varchar", length: 250, nullable: false })
    description: string;

    @Column({ type: "int", nullable: false })
    stockQuantity: number;

    @Column({ type: "float", nullable: false })
    price: number;

    @Column({ type: "enum", enum: Size, nullable: true })
    size: Size;

    // Setters
    setName(name: string): void {
        this.name = name;
    }

    setDescription(description: string): void {
        this.description = description;
    }

    setStockQuantity(stockQuantity: number): void {
        this.stockQuantity = stockQuantity;
    }

    setPrice(price: number): void {
        this.price = price;
    }

    setSize(size: Size): void {
        this.size = size;
    }

    // Getters
    getName(): string {
        return this.name;
    }

    getDescription(): string {
        return this.description;
    }

    getStockQuantity(): number {
        return this.stockQuantity;
    }

    getPrice(): number {
        return this.price;
    }

    getSize(): Size {
        return this.size;
    }

    // Product management methods
    addProduct(): void {
        // Placeholder for adding a product to the database
        // In a real implementation, this would interact with a repository
        console.log(`Adding product: ${this.name}`);
    }

    deleteProduct(): void {
        // Placeholder for deleting a product from the database
        console.log(`Deleting product: ${this.name}`);
    }

    updateProduct(): void {
        // Placeholder for updating product details
        console.log(`Updating product: ${this.name}`);
    }

    // Stock management methods
    increaseStock(quantity: number): void {
        if (quantity > 0) {
            this.stockQuantity += quantity;
        }
    }

    decreaseStock(quantity: number): void {
        if (quantity > 0 && this.stockQuantity >= quantity) {
            this.stockQuantity -= quantity;
        } else {
            throw new Error('Insufficient stock or invalid quantity');
        }
    }
}