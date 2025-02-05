import { NextRequest, NextResponse } from 'next/server';
import connectDB from "../../libs/mongodb";
import Creates from "../../models/uploads";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const data = await request.json();
        
        const newPost = await Creates.create({
            username: data.username,
            note: data.note,
            image: data.image || '',
            likes: [],
            comments: []
        });

        console.log('Created new post:', newPost);

        return NextResponse.json({ 
            message: 'Post uploaded',
            post: newPost 
        });
    } catch (error: any) {
        console.error('Post creation error:', error);
        return NextResponse.json({ 
            message: error.message || 'An error occurred'
        });
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const posts = await Creates.find().sort({ createdAt: -1 });
        
        return new NextResponse(JSON.stringify({ creator: posts }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    } catch (error: any) {
        console.error('Get posts error:', error);
        return new NextResponse(JSON.stringify({ 
            message: error.message || 'An error occurred'
        }), {
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