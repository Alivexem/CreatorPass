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

        return new NextResponse(JSON.stringify({ posts }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    } catch (error) {
        console.error('Error fetching user posts:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch posts' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    }
} 