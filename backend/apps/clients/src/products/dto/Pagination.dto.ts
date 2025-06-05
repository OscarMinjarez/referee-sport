import { IsNotEmpty, IsNumber } from "class-validator";

export default class PaginationDto {

    @IsNumber()
    @IsNotEmpty()
    page: number = 1;

    @IsNumber()
    @IsNotEmpty()
    limit: number = 10;
}