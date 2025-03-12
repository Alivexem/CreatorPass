import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import FunChat from '@/models/FunChat';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const { id } = params;

        const chats = await FunChat.find({ creatorId: id })
            .sort({ timestamp: -1 })
            .limit(100);

        return NextResponse.json({ chats });
    } catch (error) {
        console.error('Error fetching fun chats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch fun chats' },
            { status: 500 }
        );
    }
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();
        const { address, message, username, profileImage, timestamp } = body;

        if (!address || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create new fun chat
        const newChat = await FunChat.create({
            creatorId: id,
            address,
            username,
            profileImage,
            message,
            timestamp: timestamp || new Date()
        });

        // Get updated chats
        const chats = await FunChat.find({ creatorId: id })
            .sort({ timestamp: -1 })
            .limit(100);

        return NextResponse.json({ chats });
    } catch (error) {
        console.error('Error sending fun chat:', error);
        return NextResponse.json(
            { error: 'Failed to send fun chat' },
            { status: 500 }
        );
    }
}