import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import CreatorFunChat from '@/app/models/CreatorFunChat';
import Profile from '@/models/profile';

// Simple in-memory cache with 30-second TTL
const CACHE_TTL = 30000; // 30 seconds
const cache = new Map<string, { data: any; timestamp: number }>();

await connectDB();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cacheKey = `funchat_${params.id}`;
        const now = Date.now();
        const cached = cache.get(cacheKey);

        // Return cached data if valid
        if (cached && (now - cached.timestamp < CACHE_TTL)) {
            return NextResponse.json({ chats: cached.data });
        }

        const chats = await CreatorFunChat.find({ creatorId: params.id })
            .sort({ timestamp: -1 })
            .limit(50); // Limit to latest 50 messages for performance
        
        // Use Promise.all for parallel processing
        const chatsWithUsernames = await Promise.all(chats.map(async (chat) => {
            const userProfile = await Profile.findOne(
                { address: chat.address },
                { username: 1, _id: 0 } // Only fetch username field
            );
            return {
                ...chat.toObject(),
                username: userProfile?.username || 'Anonymous'
            };
        }));

        // Update cache
        cache.set(cacheKey, {
            data: chatsWithUsernames,
            timestamp: now
        });

        return NextResponse.json({ chats: chatsWithUsernames });
    } catch (error) {
        console.error('Error fetching fun chats:', error);
        return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { address, message } = await req.json();
        const userProfile = await Profile.findOne({ address }, { username: 1, profileImage: 1 });
        
        if (!userProfile) {
            return NextResponse.json(
                { error: 'Profile not found. Please create a profile first.' },
                { status: 400 }
            );
        }

        const newChat = await CreatorFunChat.create({
            creatorId: params.id,
            address,
            message,
            profileImage: userProfile.profileImage,
            timestamp: new Date().toISOString(),
            username: userProfile.username
        });

        // Invalidate cache
        const cacheKey = `funchat_${params.id}`;
        cache.delete(cacheKey);

        // Fetch only recent chats after posting
        const recentChats = await CreatorFunChat.find({ creatorId: params.id })
            .sort({ timestamp: -1 })
            .limit(50);

        const chatsWithUsernames = await Promise.all(recentChats.map(async (chat) => ({
            ...chat.toObject(),
            username: chat.username || 'Anonymous'
        })));

        return NextResponse.json({ chats: chatsWithUsernames }, { status: 201 });
    } catch (error) {
        console.error('Error creating fun chat:', error);
        return NextResponse.json({ error: 'Failed to create chat message' }, { status: 500 });
    }
}