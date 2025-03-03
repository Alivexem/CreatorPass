import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { username, note, image, passTier } = body;
    const db = mongoose.connection.db!;

    // If post is not free tier, verify user has the required pass
    if (passTier !== 'Free') {
      const userPasses = await db.collection('passes')
        .find({ address: username, category: passTier })
        .toArray();

      if (userPasses.length === 0) {
        return NextResponse.json({
          error: `You need a ${passTier} pass to create this type of post`
        }, { status: 403 });
      }
    }

    const result = await db.collection('posts').insertOne({
      username,
      note,
      image,
      passTier,
      timestamp: new Date().toISOString(),
      likes: [],
      comments: []
    });

    return NextResponse.json({ message: 'Post uploaded', postId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
} 