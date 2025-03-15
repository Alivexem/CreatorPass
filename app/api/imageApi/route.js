import cloudinary from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Modern way to handle large payloads in Next.js 13+
export async function POST(req) {
  try {
    const { data, mediaType } = await req.json();

    // Validate the base64 data
    if (!data) {
      return NextResponse.json(
        { error: 'No media data provided' },
        { status: 400 }
      );
    }

    // Configure upload options based on media type
    const uploadOptions = {
      upload_preset: 'ifndk7tr',
      resource_type: mediaType === 'video' ? 'video' : 'image',
    };

    // For videos, add these additional options
    if (mediaType === 'video') {
      Object.assign(uploadOptions, {
        chunk_size: 6000000,
        eager: [
          { format: 'mp4', transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]}
        ],
        eager_async: true
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(data, uploadOptions);

    return NextResponse.json({ url: uploadResponse.secure_url });
    
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}