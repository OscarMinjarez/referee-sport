import { Body, Controller, Param, Put } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UpdatePaymentDto } from './dto/UpdatePayment.dto';

@Controller('payments')
export class PaymentsController {

    constructor(private readonly paymentsService: PaymentsService) {}

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updatePaymentDto: UpdatePaymentDto
    ) {
        return this.paymentsService.update(id, updatePaymentDto);
    }
}
