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

    public async uploadImage(imagePath: string, publicId: string) {
        try {
            if (imagePath.startsWith('data:')) {
                if (!imagePath.startsWith('data:image/')) {
                    throw new Error('Formato de imagen no soportado. Solo se aceptan imágenes');
                }
                const correctedImagePath = imagePath.replace('data:image/png:base64', 'data:image/png;base64');
                const result = await cloudinary.uploader.upload(correctedImagePath, {
                    public_id: publicId,
                    resource_type: 'auto',
                    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
                    timeout: 30000,
                });
                if (!result?.secure_url) {
                    throw new Error('No se recibió URL de imagen desde Cloudinary');
                }
                return {
                    url: result.secure_url,
                    publicId: result.public_id,
                    format: result.format,
                    bytes: result.bytes,
                };
            } else {
                throw new Error('Solo se aceptan imágenes en formato base64');
            }
        } catch (error) {
            console.error('Error detallado en CloudinaryService:', {
                message: error,
                imagePath: imagePath?.substring(0, 50) + '...',
                publicId,
            });

            throw new HttpException(
                `Error al subir imagen: ${error}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
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