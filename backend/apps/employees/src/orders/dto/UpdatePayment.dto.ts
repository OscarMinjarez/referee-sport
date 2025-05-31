import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdatePaymentDto {
    @IsString()
    @IsOptional()
    uuid?: string;
    
    @IsNumber()
    @IsNotEmpty()
    total: number;
    
    @IsString()
    @IsOptional()
    state?: string;
}