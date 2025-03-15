import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiOptions } from 'cloudinary';

// Configure body parser for Next.js
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '100mb' // Increase the size limit to handle larger files
        }
    }
};

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { data, mediaType } = body;

        if (!data) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Set specific options based on media type
        const uploadOptions: UploadApiOptions = {
            resource_type: (mediaType === 'video' ? 'video' : 'image') as 'video' | 'image',
            // For videos, add transformation to optimize delivery
            ...(mediaType === 'video' && {
                eager: [
                    { width: 720, crop: "scale" }, // HD resolution
                ],
                eager_async: true,
                chunk_size: 6000000, // 6MB chunks for better upload handling
            })
        };

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(data, uploadOptions, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload media' },
            { status: 500 }
        );
    }
}