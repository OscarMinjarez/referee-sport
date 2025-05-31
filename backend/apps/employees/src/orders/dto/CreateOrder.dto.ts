import { Type } from "class-transformer";
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateOrderItemDto } from "./CreateOrderItem.dto";
import { CreatePaymentDto } from "./CreatePayment.dto";

export class CreateOrderDto {
    @IsNumber()
    @IsNotEmpty()
    numberOrder: number;
  
    @IsNumber()
    @IsNotEmpty()
    total: number;
  
    @IsString()
    @IsOptional()
    specifications?: string;
  
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    date?: Date;
  
    @IsString()
    @IsNotEmpty()
    customerId: string;
  
    @IsString()
    @IsNotEmpty()
    employeeId: string;
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    @IsOptional()
    orderItems?: CreateOrderItemDto[];
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePaymentDto)
    @IsOptional()
    payments?: CreatePaymentDto[];
}