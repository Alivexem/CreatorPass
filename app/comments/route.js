import connectDB from "../../libs/mongodb";
import Comment from '../../commentSchema/coupload'; // Import the Comment model

// Connect to MongoDB once for the module
await connectDB();

// Handler for GET requests
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId'); // Retrieve the postId from query params

    if (!postId) {
      return new Response(JSON.stringify({ error: 'Post ID is required' }), { status: 400 });
    }

    // Fetch comments for the specific postId
    const comments = await Comment.find({ postId }).sort({ createdAt: 1 });

    return new Response(JSON.stringify(comments), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to fetch comments' }), { status: 500 });
  }
}

// Handler for POST requests
export async function POST(request) {
    try {
      const { postId, comment } = await request.json();
  
      if (!postId || !comment) {
        return new Response(JSON.stringify({ error: 'Post ID and comment are required' }), { status: 400 });
      }
  
      // Create a new comment document
      const newComment = await Comment.create({ postId, comment });
  
      // Update the comment count in the associated post
      await Comment.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
  
      return new Response(JSON.stringify(newComment), { status: 201 });
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: 'Failed to add comment' }), { status: 500 });
    }
  }
  