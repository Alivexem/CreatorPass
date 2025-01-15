import { NextResponse } from "next/server";
import connectDB from "../../../libs/mongodb";
import Creates from "../../../models/uploads";

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = params;

        if (!id) {
            return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
        }

        // Find and delete the post
        const deletedPost = await Creates.findByIdAndDelete(id);

        if (!deletedPost) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            message: 'Post deleted successfully',
            post: deletedPost 
        });
    } catch (error) {
        console.error('Delete post error:', error);
        return NextResponse.json({ 
            message: `Error deleting post: ${error.message}` 
        }, { status: 500 });
    }
} 