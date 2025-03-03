import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import Post from '@/models/Post';
import Pass from '@/models/Pass';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { type, userAddress, data } = await request.json();

    // Verify user has required pass level for interaction
    const post = await Post.findById(params.id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.category !== 'free') {
      const hasPass = await Pass.exists({
        address: post.username,
        'owners.address': userAddress,
        category: { $gte: post.category }
      });

      if (!hasPass) {
        return NextResponse.json({ error: 'Pass required for this interaction' }, { status: 403 });
      }
    }

    // Handle different interaction types
    switch (type) {
      case 'like':
        if (post.likes.includes(userAddress)) {
          post.likes = post.likes.filter(addr => addr !== userAddress);
        } else {
          post.likes.push(userAddress);
        }
        break;

      case 'comment':
        post.comments.push({
          address: userAddress,
          text: data.text,
          timestamp: new Date()
        });
        break;

      case 'gift':
        // Record gift transaction
        post.gifts = post.gifts || [];
        post.gifts.push({
          from: userAddress,
          amount: data.amount,
          timestamp: new Date()
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid interaction type' }, { status: 400 });
    }

    await post.save();
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process interaction' }, { status: 500 });
  }
} 