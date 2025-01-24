import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import Creates from '@/models/uploads';

interface RequestContext {
    params: {
        address: string;
    };
}

export async function GET(
    _request: NextRequest,
    context: RequestContext
): Promise<NextResponse> {
    try {
        await connectDB();
        const { address } = context.params;

        const posts = await Creates.find({ username: address })
            .sort({ createdAt: -1 });

        return NextResponse.json({ posts });
    } catch (error) {
        console.error('Error fetching user posts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        );
    }
} 