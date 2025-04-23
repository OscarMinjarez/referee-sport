import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { SizeValue } from '@app/entities/classes/size.entity';

export class VariantDto {
    @IsNotEmpty()
    @IsEnum(SizeValue)
    size: SizeValue;

    @IsNotEmpty()
    @IsNumber()
    @Min(0, { message: 'La cantidad no puede ser negativa' })
    quantity: number;
}
