import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import Creates from "@/models/uploads";
import Profile from "@/models/profile";

export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { address } = await request.json();
        const { id } = params;

        if (!address) {
            return NextResponse.json({ message: 'Address is required' }, { status: 400 });
        }

        const post = await Creates.findById(id);
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        const baseUrl = new URL(request.url).origin;

        // Toggle like status
        const isLiked = post.likes.includes(address);

        // Only update CRTP points for the user doing the liking
        const liker = await Profile.findOne({ address });

        if (!isLiked) {
            post.likes.push(address);
            post.likeCount = (post.likeCount || 0) + 1;
            
            // Update only liker's CRTP points
            if (liker) await liker.updateCRTP('LIKE');
        } else {
            post.likes = post.likes.filter(like => like !== address);
            post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
            
            // Update only liker's CRTP points
            if (liker) await liker.updateCRTP('UNLIKE');
        }

        await post.save();

        return NextResponse.json({
            message: isLiked ? 'Like removed' : 'Post liked',
            likes: post.likes,
            likeCount: post.likeCount
        });
    } catch (error) {
        console.error('Like update error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}