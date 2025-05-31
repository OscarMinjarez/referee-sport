import { IsNotEmpty, IsNumber, IsString, IsOptional } from "class-validator";

export class UpdateOrderItemDto {
    @IsString()
    @IsOptional()
    uuid?: string;
    
    @IsString()
    @IsNotEmpty()
    productId: string;
  
    @IsNumber()
    @IsNotEmpty()
    quantity: number;
  
    @IsNumber()
    @IsNotEmpty()
    totalPrice: number;

    @IsString()
    @IsNotEmpty()
    productVariantId: string;
}

