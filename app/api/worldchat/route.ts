import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import WorldChat from '@/models/worldchat';
import Profile from '@/models/profile';

// Connect to MongoDB once for the module
await connectDB();

export async function GET() {
    try {
        const chats = await WorldChat.find().sort({ timestamp: 1 });
        
        // Fetch usernames for all chat messages
        const chatsWithUsernames = await Promise.all(chats.map(async (chat) => {
            const userProfile = await Profile.findOne({ address: chat.address });
            return {
                ...chat.toObject(),
                username: userProfile?.username || 'Anonymous'
            };
        }));

        return new NextResponse(
            JSON.stringify({ chats: chatsWithUsernames }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching chats:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to fetch chats' }),
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const { address, message } = await req.json();

        // Get user profile first
        const userProfile = await Profile.findOne({ address });
        if (!userProfile) {
            return new NextResponse(
                JSON.stringify({ error: 'Profile not found. Please create a profile first.' }),
                { status: 400 }
            );
        }

        const newChat = await WorldChat.create({
            address,
            message,
            profileImage: userProfile.profileImage,
            timestamp: new Date().toISOString(),
            country: userProfile.country || undefined
        });

        // Include username in response
        const chatWithUsername = {
            ...newChat.toObject(),
            username: userProfile.username
        };

        return new NextResponse(
            JSON.stringify({ chat: chatWithUsername }),
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating chat:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to create chat message' }),
            { status: 500 }
        );
    }
}