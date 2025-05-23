import Payment, { PaymentState } from '@app/entities/classes/payment.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePaymentDto } from './dto/UpdatePayment.dto';

@Injectable()
export class PaymentsService {

    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
    ) {}
    
    async update(id: string, updatePaymentDto: UpdatePaymentDto) {
        const payment = await this.paymentRepository.findOneBy({ uuid: id });
        if (!payment) {
            throw new NotFoundException('Pago no encontrado');
        }
        if (updatePaymentDto.amountPaid !== undefined) {
            payment.amountPaid = updatePaymentDto.amountPaid;
            if (payment.amountPaid === 0) {
                payment.state = PaymentState.Pending;
            } else if (payment.amountPaid >= payment.total) {
                payment.state = PaymentState.Completed;
            } else if (payment.amountPaid > 0 && payment.amountPaid < payment.total) {
                payment.state = PaymentState.Partial;
            }
        }
        if (updatePaymentDto.state) {
            payment.state = updatePaymentDto.state;
        }
        return this.paymentRepository.save(payment);
    }
}
