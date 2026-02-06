import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

import * as streamifier from 'streamifier';
import { CloudinaryResponse } from './cloudinary-response';

@Injectable()
export class UploadService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async uploadImage(file: Express.Multer.File): Promise<CloudinaryResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream((error, result) => {
                if (error) return reject(error);
                resolve(result);
            });

            streamifier.createReadStream(file.buffer).pipe(upload);
        });
    }
}
