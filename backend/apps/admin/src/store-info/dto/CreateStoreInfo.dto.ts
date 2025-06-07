import { IsEmail, IsJSON, IsNotEmpty, IsOptional, IsString } from "class-validator";

export default class CreateStoreInfoDto {

    @IsString()
    @IsNotEmpty()
    storeName: string;

    @IsString()
    @IsNotEmpty()
    about: string;

    @IsString()
    @IsOptional()
    phoneNumber: string;

    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    rfc: string;

    @IsOptional()
    @IsJSON()
    socialMedia: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        youtube?: string;
        tiktok?: string;
        whatsapp?: string;
        telegram?: string;
        linkedin?: string;
    };
}