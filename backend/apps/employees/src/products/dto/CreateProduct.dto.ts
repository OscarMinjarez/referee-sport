import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { VariantDto } from './variant.dto';

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
    @Min(0.01, { message: 'El precio debe ser mayor a 0' })
    price: number;

    @IsOptional()
    @IsString()
    imagePath?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VariantDto)
    variants?: VariantDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(20, { each: true, message: 'Cada etiqueta no puede exceder 20 caracteres' })
    tags?: string[];
}
