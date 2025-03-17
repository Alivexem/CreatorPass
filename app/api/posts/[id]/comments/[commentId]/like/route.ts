// app/api/posts/[postId]/comments/[commentId]/like/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import Creates from '@/models/uploads';
import Profile from '@/models/profile';
import mongoose from 'mongoose';

export async function PUT(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    await connectDB();
    
    const { id, commentId } = params;
    const { address } = await request.json();

    // Validate ObjectId format for both IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: 'Invalid post ID or comment ID' }, { status: 400 });
    }

    // Find the post document by its ID
    const targetPost = await Creates.findById(id);
    if (!targetPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Find the comment in the comments array
    const commentIndex = targetPost.comments.findIndex(
      (comment: any) => comment._id.toString() === commentId
    );
    
    if (commentIndex === -1) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Get the comment and initialize likes array if needed
    const comment = targetPost.comments[commentIndex];
    if (!comment.likes) {
      comment.likes = [];
    }

    // Toggle like and update CRTP
    const hasLiked = comment.likes.includes(address);
    
    // Update creator's CRTP points
    const creatorProfile = await Profile.findOne({ address: targetPost.username });
    if (creatorProfile) {
      await creatorProfile.updateCRTP(hasLiked ? 'unlike' : 'like');
    }

    // Update user's CRTP points who is liking/unliking
    const userProfile = await Profile.findOne({ address });
    if (userProfile) {
      await userProfile.updateCRTP(hasLiked ? 'unlike' : 'like');
    }

    if (hasLiked) {
      comment.likes = comment.likes.filter((like: string) => like !== address);
      comment.likeCount = Math.max(0, (comment.likeCount || 1) - 1);
    } else {
      comment.likes.push(address);
      comment.likeCount = (comment.likeCount || 0) + 1;
    }

    // Update the comment in the array
    targetPost.comments[commentIndex] = comment;
    await targetPost.save();

    // Update the response to be more concise
    return NextResponse.json({
      success: true,
      likeCount: comment.likeCount,
      liked: !hasLiked
    });

  } catch (error) {
    console.error('Error updating comment like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}