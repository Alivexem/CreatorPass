import { NextResponse } from 'next/server';
import connectDB from '../../../../../libs/mongodb';
import Creates from '../../../../../models/uploads';

type Params = { id: string };

export async function PUT(request: Request, context: { params: Params }) {
    try {
        await connectDB();

        const { id } = await context.params;
        const { address }: { address: string } = await request.json();

        // Find post and log initial state
        const post = await Creates.findById(id);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        console.log('Post before update:', {
            ...post.toObject(),
            currentLikeCount: post.likeCount || 0
        });

        // Update like status and count
        const hasLiked = post.likes?.includes(address);
        const updateOperation = hasLiked
            ? { 
                $pull: { likes: address },
                $inc: { likeCount: -1 }
              }
            : { 
                $addToSet: { likes: address },
                $inc: { likeCount: 1 }
              };

        const updatedPost = await Creates.findByIdAndUpdate(
            id,
            updateOperation,
            { new: true }
        );

        console.log('Post after update:', {
            ...updatedPost.toObject(),
            currentLikeCount: updatedPost.likeCount
        });

        return NextResponse.json({ 
            success: true, 
            likeCount: updatedPost.likeCount,
            hasLiked: !hasLiked
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
