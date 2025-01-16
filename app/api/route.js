import { NextResponse } from "next/server";
import connectDB from "../../libs/mongodb";
import Creates from "../../models/uploads";

export async function POST(request) {
    try {
        await connectDB();
        const data = await request.json();
        
        // Create new post with initialized arrays
        const newPost = await Creates.create({
            username: data.username,
            note: data.note,
            image: data.image || '',
            likes: [],      // Initialize empty likes array
            comments: [],   // Initialize empty comments array
        });

        console.log('Created new post:', newPost);

        return NextResponse.json({ 
            message: 'Post uploaded',
            post: newPost 
        });
    } catch (error) {
        console.error('Post creation error:', error);
        return NextResponse.json({ message: error.message });
    }
}

export async function GET() {
    try {
        await connectDB();
        const posts = await Creates.find().sort({ createdAt: -1 });
        
        // Log each post with its like count
        posts.forEach(post => {
            console.log('Post:', {
                ...post.toObject(),
                likeCount: post.likes?.length || 0
            });
        });

        return NextResponse.json({ creator: posts });
    } catch (error) {
        console.error('Get posts error:', error);
        return NextResponse.json({ message: error.message });
    }
}