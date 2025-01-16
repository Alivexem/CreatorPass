import { NextResponse } from 'next/server';
import connectDB from '../../../../../libs/mongodb';
import Creates from '../../../../../models/uploads';

type Params = { id: string };

export async function PUT(request: Request, context: { params: Params }) {
    try {
        await connectDB();

        const { id } = await context.params; // Await params to ensure proper access
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
