import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiOptions } from 'cloudinary';

// Remove the deprecated config export
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Add size limit using middleware pattern
export async function POST(req: NextRequest) {
    // Check content length
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    if (contentLength > 100 * 1024 * 1024) { // 100MB limit
        return NextResponse.json(
            { error: 'File size too large' },
            { status: 413 }
        );
    }

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