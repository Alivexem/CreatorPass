import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import WorldChat from '@/models/worldchat';
import Profile from '@/models/profile';

export async function GET() {
    try {
        await connectDB();
        const chats = await WorldChat.find()
            .sort({ timestamp: -1 })
            .limit(50);
        return NextResponse.json({ chats });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { address, message } = await request.json();
        
        // Get user's profile
        const profile = await Profile.findOne({ address });
        
        if (!profile || !profile.username || !profile.profileImage) {
            return NextResponse.json(
                { error: 'Please update your profile in dashboard to engage in world chat' },
                { status: 403 }
            );
        }

        const chat = await WorldChat.create({
            address,
            message,
            profileImage: profile.profileImage,
            country: profile.country
        });

        return NextResponse.json({ chat });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
} 