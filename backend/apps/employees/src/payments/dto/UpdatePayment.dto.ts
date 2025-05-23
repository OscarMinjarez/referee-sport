import { PaymentState } from "@app/entities";
import { IsEnum, IsNumber, Min } from "class-validator";

export class UpdatePaymentDto {
    @IsNumber()
    @Min(0)
    amountPaid?: number;
  
    @IsEnum(PaymentState)
    state?: PaymentState;
}