import {IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested} from 'class-validator';
import { Type } from 'class-transformer';
import { SizeValue } from '@app/entities/classes/size.entity';

class SizeDto {
    @IsNotEmpty()
    @IsString()
    size: SizeValue;
}

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50, { message: 'El nombre no puede exceder los 50 caracteres' })
    name: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(250, { message: 'La descripción no puede exceder los 250 caracteres' })
    description: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0, { message: 'El stock no puede ser negativo' })
    stockQuantity: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0.01, { message: 'El precio debe ser mayor a 0' })
    price: number;

    @IsOptional()
    @IsString()
    imagePath?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => SizeDto)
    size?: SizeDto;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(20, { each: true, message: 'Cada etiqueta no puede exceder 20 caracteres' })
    tags?: string[];
}