import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as stream from 'stream';

@Injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dqto9uwf0',
            api_key: process.env.CLOUDINARY_API_KEY || '229376896198435',
            api_secret: process.env.CLOUDINARY_API_SECRET || 'wwq_gqv2jT4QUtDFdQCGHy6a9f4',
        });
    }

    public async uploadImage(buffer: Buffer, publicId: string) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    public_id: publicId,
                    resource_type: 'image',
                    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            const readable = new stream.PassThrough();
            readable.end(buffer);
            readable.pipe(uploadStream);
        });
    }      

    public async getImage(publicId: string) {
        try {
            if (!publicId) {
                throw new Error('publicId es requerido');
            }
            return cloudinary.url(publicId, {
                secure: true,
                transformation: [
                    {
                        quality: 'auto',
                        fetch_format: 'auto',
                    },
                    {
                        crop: 'fill',
                        gravity: 'auto',
                    },
                ],
            });
        } catch (error) {
            console.error('Error al obtener imagen:', error);
            throw new HttpException(
                `Error al generar URL de imagen: ${error}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }
    public async deleteImage(publicId: string) {
        try {
            return await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            throw new HttpException(
                `Error al eliminar imagen: ${error}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}