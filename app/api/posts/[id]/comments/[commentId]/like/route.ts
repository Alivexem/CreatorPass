// app/api/posts/[postId]/comments/[commentId]/like/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import Post from '@/models/post';
import mongoose from 'mongoose';

export async function PUT(
  request: Request,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    await connectDB();
    
    const { postId, commentId } = params;
    const { address } = await request.json();

    // Validate ObjectId format
    // if (!mongoose.Types.ObjectId.isValid(postId)) {
    //   return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    // }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Find the comment in the comments array
    const commentIndex = post.comments.findIndex(
      (comment: any) => comment._id.toString() === commentId
    );
    
    if (commentIndex === -1) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Get the comment and initialize likes array if needed
    const comment = post.comments[commentIndex];
    if (!comment.likes) {
      comment.likes = [];
    }

    // Toggle like
    const hasLiked = comment.likes.includes(address);
    if (hasLiked) {
      comment.likes = comment.likes.filter((like: string) => like !== address);
      comment.likeCount = Math.max(0, (comment.likeCount || 1) - 1);
    } else {
      comment.likes.push(address);
      comment.likeCount = (comment.likeCount || 0) + 1;
    }

    // Update the comment in the array
    post.comments[commentIndex] = comment;
    await post.save();

    return NextResponse.json({
      success: true,
      liked: !hasLiked,
      likeCount: comment.likeCount,
      commentId: commentId
    });

  } catch (error) {
    console.error('Error updating comment like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}