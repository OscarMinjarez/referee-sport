import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class CloudinaryService {

    constructor() {
        cloudinary.config({
            cloud_name: "dqto9uwf0",
            api_key: "229376896198435",
            api_secret: "wwq_gqv2jT4QUtDFdQCGHy6a9f4"
        });
    }

    public async uploadImage(imagePath: string, publicId: string) {
        try {
            return await cloudinary.uploader.upload(
                imagePath, { public_id: publicId }
            );
        } catch (e: unknown) {
            console.error(e);
        }
    }

    public async getImage(publicId: string) {
        try {
            return cloudinary.url(publicId, {
                transformation: [
                    {
                        quality: "auto",
                        fetch_format: "auto"
                    },
                    {
                        width: 600,
                        height: 600,
                        crop: "fill",
                        gravity: "auto"
                    }
                ]
            });
        } catch (e: unknown) {
            console.error(e);
        }
    }
}
