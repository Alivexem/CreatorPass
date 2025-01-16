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
        
        posts.forEach(post => {
            console.log('Post:', {
                ...post.toObject(),
                likeCount: post.likes?.length || 0
            });
        });

        return NextResponse.json({ creator: posts });
    } catch (error: any) {
        console.error('Get posts error:', error);
        return NextResponse.json({ 
            message: error.message || 'An error occurred'
        });
    }
}