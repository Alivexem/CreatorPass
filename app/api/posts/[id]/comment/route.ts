import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import Post from '@/models/post';
import Profile from '@/models/profile';
import mongoose from 'mongoose';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { address, comment, imageUrl } = await request.json();

        // Fetch user profile
        const profile = await Profile.findOne({ address }).select('username profileImage address');
        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const newComment = {
            _id: new mongoose.Types.ObjectId(), // Generate new ObjectId
            address: profile.address,
            username: profile.username,
            profileImage: profile.profileImage || '/empProfile.png',
            comment,
            imageUrl: imageUrl || '',
            timestamp: new Date(),
            likes: [],
            likeCount: 0
        };

        const post = await Post.findByIdAndUpdate(
            params.id,
            { $push: { comments: newComment } },
            { new: true }
        );

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json({ comments: post.comments });
    } catch (error) {
        console.error('Error in comment API:', error);
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
}