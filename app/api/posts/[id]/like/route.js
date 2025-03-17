import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import Creates from "@/models/uploads";

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
        
        if (!isLiked) {
            // Add like and update CRTP
            post.likes.push(address);
            post.likeCount = (post.likeCount || 0) + 1;
            
            // Update CRTP points for the user who liked the post
            await fetch(`
${baseUrl}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: address, // Changed to liker's address
                    metricType: 'crtp',
                    value: 15 // +15 points for liking a post
                })
            });
        } else {
            // Remove like and deduct CRTP
            post.likes = post.likes.filter(like => like !== address);
            post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
            
            // Update CRTP points for the user who unliked the post
            await fetch(`
${baseUrl}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: address, // Changed to liker's address
                    metricType: 'crtp',
                    value: -15 // -15 points when unliking
                })
            });
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