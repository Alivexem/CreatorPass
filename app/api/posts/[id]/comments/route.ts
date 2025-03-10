import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import { ObjectId, Document, UpdateFilter } from 'mongodb';
import mongoose from 'mongoose';

interface CommentDoc {
    _id: ObjectId;
    address: string;
    username: string;
    profileImage: string;
    comment: string;
    timestamp: Date;
    likes: string[];
    likeCount: number;
    replies?: CommentDoc[];
    hasReplies?: boolean;
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const db = mongoose.connection.db;
        if (!db) throw new Error('Database connection not established');

        const { address, comment, replyToId, username, profileImage } = await request.json();

        if (!address || !comment) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const commentDoc: CommentDoc = {
            _id: new ObjectId(),
            address,
            username,
            profileImage,
            comment,
            timestamp: new Date(),
            likes: [],
            likeCount: 0,
            replies: []
        };

        if (replyToId) {
            const updateOperation: UpdateFilter<Document> = {
                $push: { 'comments.$[elem].replies': commentDoc as any },
                $set: { 'comments.$[elem].hasReplies': true }
            };

            await db.collection('creator').updateOne(
                { _id: new ObjectId(params.id) },
                updateOperation,
                { 
                    arrayFilters: [{ 'elem._id': new ObjectId(replyToId) }]
                }
            );
        } else {
            await db.collection('creator').updateOne(
                { _id: new ObjectId(params.id) },
                { 
                    $push: { 
                        comments: commentDoc as any 
                    } 
                } as UpdateFilter<Document>
            );
        }

        const updatedPost = await db.collection('creator').findOne(
            { _id: new ObjectId(params.id) }
        );

        return NextResponse.json({ comments: updatedPost?.comments || [] });
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const db = mongoose.connection.db;
        if (!db) throw new Error('Database connection not established');

        const post = await db.collection('creator').findOne(
            { _id: new ObjectId(params.id) }
        );

        return NextResponse.json({ comments: post?.comments || [] });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}
