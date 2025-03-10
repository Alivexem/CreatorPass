import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import creates from '@/models/uploads';
import { ObjectId } from 'mongodb';

interface RouteParams {
    params: {
        postId: string;
    }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { postId } = params;
        const post = await creates.findOne(
            { "posts._id": postId },
            { "posts.$": 1 }
        );

        if (!post || !post.posts[0]) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json({ comments: post.posts[0].comments || [] });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { postId } = params;
        const { address, comment, username, profileImage, replyToId } = await request.json();

        const newComment = {
            _id: new ObjectId(),
            address,
            username,
            comment,
            profileImage,
            timestamp: new Date(),
            likes: [],
            likeCount: 0
        };

        let updateOperation;
        if (replyToId) {
            updateOperation = {
                $push: { "posts.$.comments.$[comment].replies": newComment }
            };
        } else {
            updateOperation = {
                $push: { "posts.$.comments": newComment }
            };
        }

        const result = await creates.updateOne(
            { "posts._id": postId },
            updateOperation,
            replyToId ? {
                arrayFilters: [{ "comment._id": replyToId }]
            } : {}
        );

        if (!result.matchedCount) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Get updated post with comments
        const updatedPost = await creates.findOne(
            { "posts._id": postId },
            { "posts.$": 1 }
        );

        return NextResponse.json({ comments: updatedPost?.posts[0].comments || [] });
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
