import { Type } from "class-transformer";
import { IsArray, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { UpdateOrderItemDto } from "./UpdateOrderItem.dto";
import { UpdatePaymentDto } from "./UpdatePayment.dto";

export class UpdateOrderDto {
    @IsNumber()
    @IsString()
    numberOrder?: string;
  
    @IsNumber()
    @IsOptional()
    total?: number;
  
    @IsString()
    @IsOptional()
    specifications?: string;
  
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    date?: Date;
  
    @IsString()
    @IsOptional()
    customerId?: string;
  
    @IsString()
    @IsOptional()
    employeeId?: string;
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateOrderItemDto)
    @IsOptional()
    orderItems?: UpdateOrderItemDto[];
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdatePaymentDto)
    @IsOptional()
    payments?: UpdatePaymentDto[];
}