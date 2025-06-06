import { IsNotEmpty, IsNumber } from "class-validator";

export class CreatePaymentDto {
    @IsNumber()
    @IsNotEmpty()
    total: number;
}