import { NextResponse } from "next/server";
import connectDB from "../../libs/mongodb";
import Creates from "../../models/uploads";

export async function POST(request) {
    try {
        await connectDB();
        const { username, note, image } = await request.json();
        
        if (!note) {
            return NextResponse.json({ message: 'Note is required' }, { status: 400 });
        }

        const newPost = await Creates.create({ username, note, image });
        return NextResponse.json({ message: 'Post uploaded', post: newPost }, { status: 201 });
    } catch (error) {
        console.error('Detailed post creation error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json({ 
            message: `Connection error: ${error.message}` 
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const creator = await Creates.find().sort({ createdAt: -1 });
        return NextResponse.json({ creator });
    } catch (error) {
        console.error('Get posts error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}