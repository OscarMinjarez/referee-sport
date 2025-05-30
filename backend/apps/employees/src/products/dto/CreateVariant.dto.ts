import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class VariantDto {
    @IsNotEmpty()
    @IsString()
    type: string;

    @IsNotEmpty()
    @IsString()
    value: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0, { message: 'La cantidad no puede ser negativa' })
    quantity: number;
}
