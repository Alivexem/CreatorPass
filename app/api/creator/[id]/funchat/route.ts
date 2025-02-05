import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import CreatorFunChat from '@/app/models/CreatorFunChat';
import Profile from '@/models/profile';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        
        const creatorChats = await CreatorFunChat.findOne({ 
            creatorAddress: params.id 
        });
        
        return new NextResponse(JSON.stringify({ chats: creatorChats?.chats || [] }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch chats' }), {
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

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { address, message } = await req.json();

        // Verify if user has Gold Tier Pass (implement your verification logic here)
        
        const profile = await Profile.findOne({ address });
        
        const chat = {
            address,
            message,
            profileImage: profile?.profileImage || '/empProfile.png',
            timestamp: new Date()
        };

        const creatorChat = await CreatorFunChat.findOneAndUpdate(
            { creatorAddress: params.id },
            { 
                $push: { 
                    chats: { 
                        $each: [chat],
                        $sort: { timestamp: -1 }
                    }
                } 
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ chats: creatorChat.chats });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
} 