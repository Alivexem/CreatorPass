import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(base64String, {
                folder: 'creator-pass-profiles'
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return NextResponse.json({ 
            message: 'Image uploaded successfully',
            imageUrl: uploadResponse.secure_url 
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ 
            message: `Upload failed: ${error.message}` 
        }, { status: 500 });
    }
} 