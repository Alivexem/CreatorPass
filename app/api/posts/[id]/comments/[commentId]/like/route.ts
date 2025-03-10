import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import { ObjectId, Document, UpdateFilter } from 'mongodb';
import mongoose from 'mongoose';

interface Comment {
    _id: ObjectId | string;
    likes: string[];
    likeCount: number;
    replies?: Comment[];
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string; commentId: string } }
) {
    try {
        await connectDB();
        const db = mongoose.connection.db;
        if (!db) throw new Error('Database connection not established');

        const { address } = await request.json();

        const post = await db.collection('creator').findOne(
            { _id: new ObjectId(params.id) }
        );

        if (!post?.comments) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Update likes in both main comments and replies
        const updateComment = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
                if (comment._id.toString() === params.commentId) {
                    const likeIndex = comment.likes.indexOf(address);
                    if (likeIndex === -1) {
                        comment.likes.push(address);
                    } else {
                        comment.likes.splice(likeIndex, 1);
                    }
                    comment.likeCount = comment.likes.length;
                    return comment;
                }
                if (comment.replies) {
                    comment.replies = updateComment(comment.replies);
                }
                return comment;
            });
        };

        const updatedComments = updateComment(post.comments);

        await db.collection('creator').updateOne(
            { _id: new ObjectId(params.id) },
            { 
                $set: { 
                    comments: updatedComments 
                } 
            } as UpdateFilter<Document>
        );

        const updatedComment = updatedComments.find((c: Comment) => c._id.toString() === params.commentId) || 
                             updatedComments.flatMap((c: Comment) => c.replies || [])
                                          .find((r: Comment) => r._id.toString() === params.commentId);

        if (!updatedComment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        return NextResponse.json({
            likeCount: updatedComment.likeCount,
            likes: updatedComment.likes
        });
    } catch (error) {
        console.error('Error updating like:', error);
        return NextResponse.json({ error: 'Failed to update like' }, { status: 500 });
    }
}
