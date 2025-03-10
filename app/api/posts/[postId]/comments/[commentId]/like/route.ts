import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import creates from '@/models/uploads';

interface RouteParams {
    params: {
        postId: string;
        commentId: string;
    }
}

interface Comment {
    _id: string;
    likes: string[];
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { postId, commentId } = params;
        const { address } = await request.json();

        const post = await creates.findOne(
            { "posts._id": postId },
            { "posts.$": 1 }
        );

        if (!post || !post.posts[0]) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const comment = post.posts[0].comments?.find(
            (c: Comment) => c._id.toString() === commentId
        );

        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        // Toggle like
        const hasLiked = comment.likes.includes(address);
        const updateOperation = hasLiked
            ? {
                $pull: { "posts.$.comments.$[comment].likes": address },
                $inc: { "posts.$.comments.$[comment].likeCount": -1 }
            }
            : {
                $addToSet: { "posts.$.comments.$[comment].likes": address },
                $inc: { "posts.$.comments.$[comment].likeCount": 1 }
            };

        await creates.updateOne(
            { "posts._id": postId },
            updateOperation,
            {
                arrayFilters: [{ "comment._id": commentId }]
            }
        );

        // Get updated comments
        const updatedPost = await creates.findOne(
            { "posts._id": postId },
            { "posts.$": 1 }
        );

        return NextResponse.json({
            comments: updatedPost?.posts[0].comments || [],
            success: true
        });
    } catch (error) {
        console.error('Error updating comment like:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
