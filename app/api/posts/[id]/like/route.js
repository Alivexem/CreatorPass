import { NextResponse } from 'next/server';
import connectDB from '../../../../../libs/mongodb';
import Creates from '../../../../../models/uploads';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { address } = await request.json();

    const post = await Creates.findById(id);
    if (!post) {
      return new NextResponse(JSON.stringify({ error: 'Post not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle like logic
    const hasLiked = post.likes.includes(address);
    
    if (hasLiked) {
      post.likes = post.likes.filter(like => like !== address);
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      post.likes.push(address);
      post.likeCount = (post.likeCount || 0) + 1;
    }

    await post.save();

    return new NextResponse(JSON.stringify({ 
      success: true,
      liked: !hasLiked,
      likeCount: post.likeCount
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating like:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}