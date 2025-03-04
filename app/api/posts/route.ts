import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import Post from '@/models/Post';
import { uploadToCloudinary } from '@/utils/cloudinary';

export async function POST(request: Request) {
  try {
    await connectDB();
    const formData = await request.formData();
    const note = formData.get('note') as string;
    const category = formData.get('category') as string;
    const username = formData.get('username') as string;
    const mediaFile = formData.get('media') as File;

    let mediaType = 'none';
    let mediaUrl = '';

    if (mediaFile) {
      const fileType = mediaFile.type.split('/')[0];
      if (fileType === 'image' || fileType === 'video') {
        mediaType = fileType;
        mediaUrl = await uploadToCloudinary(mediaFile);
      }
    }

    const post = await Post.create({
      username,
      note,
      category,
      mediaType,
      mediaUrl
    });

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
} 