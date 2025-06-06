import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export default class PaginationDto {

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    page: number = 1;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    limit: number = 10;
}