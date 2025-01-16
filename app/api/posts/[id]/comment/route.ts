import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../libs/mongodb';
import Creates from '../../../../../models/uploads';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const { id } = params;
        const { address, comment }: { address: string; comment: string } = await request.json();

        // Find the post by ID
        const post = await Creates.findById(id);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Add the comment
        post.comments.push({ address, comment, timestamp: new Date() });
        await post.save();

        return NextResponse.json({ success: true, comments: post.comments });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
