import { NextRequest, NextResponse } from 'next/server';
import connectDB from "../../libs/mongodb";
import Creates from "../../models/uploads";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const requestData = await request.json();
        console.log('Server - Received post data:', JSON.stringify(requestData, null, 2));
        
        const { username, note, image, video, tier, mediaType, timestamp } = requestData;
        console.log('Server - Destructured tier:', tier);
        
        if (!username || !note) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const postData = {
            username,
            note,
            image: image || '',
            video: video || '',
            mediaType: mediaType || 'image',
            tier: tier || 'Free',
            createdAt: timestamp || new Date().toISOString(),
            likes: [],
            likeCount: 0,
            comments: []
        };

        console.log('Server - Final post data before saving:', JSON.stringify(postData, null, 2));

        const post = new Creates(postData);
        console.log('Server - Created model instance:', post);
        
        const savedPost = await post.save();
        console.log('Server - Saved post document:', JSON.stringify(savedPost.toObject(), null, 2));

        return NextResponse.json({ 
            message: 'Post uploaded',
            post: savedPost 
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