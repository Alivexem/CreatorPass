import { NextResponse } from 'next/server';
import connectDB from '../../../../libs/mongodb';
import Creates from '../../../../models/uploads';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const post = await Creates.findById(id);
    
    if (!post) {
      return new NextResponse(JSON.stringify({ error: 'Post not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new NextResponse(JSON.stringify(post), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = params;

        if (!id) {
            return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
        }

        const deletedPost = await Creates.findByIdAndDelete(id);

        if (!deletedPost) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            message: 'Post deleted successfully',
            post: deletedPost 
        });
    } catch (error) {
        console.error('Delete post error:', error);
        return NextResponse.json({ 
            message: `Error deleting post: ${error.message}` 
        }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const body = await request.json();
        const { action, address, commentId, comment, imageUrl } = body;

        const post = await Creates.findById(id);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Handle comment likes - improved error handling and response
        if (action === 'likeComment' && commentId) {
            const commentToLike = post.comments.id(commentId);
            if (!commentToLike) {
                return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
            }

            // Initialize likes array if it doesn't exist
            if (!commentToLike.likes) {
                commentToLike.likes = [];
            }

            const hasLiked = commentToLike.likes.includes(address);
            
            if (hasLiked) {
                commentToLike.likes = commentToLike.likes.filter(like => like !== address);
                commentToLike.likeCount = Math.max(0, (commentToLike.likeCount || 1) - 1);
            } else {
                commentToLike.likes.push(address);
                commentToLike.likeCount = (commentToLike.likeCount || 0) + 1;
            }

            await post.save();
            return NextResponse.json({ 
                success: true,
                liked: !hasLiked,
                likeCount: commentToLike.likeCount,
                commentId: commentId
            });
        }

        // Handle likes
        if (action === 'like') {
            const hasLiked = post.likes.includes(address);
            
            if (hasLiked) {
                post.likes = post.likes.filter(like => like !== address);
                post.likeCount = Math.max(0, post.likeCount - 1);
            } else {
                post.likes.push(address);
                post.likeCount = (post.likeCount || 0) + 1;
            }

            await post.save();
            return NextResponse.json({ 
                success: true,
                liked: !hasLiked,
                likeCount: post.likeCount
            });
        }

        // Handle comments
        if (action === 'comment') {
            const newComment = {
                address,
                comment,
                imageUrl,  // Add the imageUrl to the comment object
                timestamp: new Date(),
                likes: [],
                likeCount: 0
            };
            
            post.comments.push(newComment);
            await post.save();
            return NextResponse.json({ success: true, comments: post.comments });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
