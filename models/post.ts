import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    address: String,
    username: String,
    profileImage: String,
    comment: String,
    imageUrl: String,
    timestamp: { type: Date, default: Date.now },
    likes: [String],
    likeCount: { type: Number, default: 0 }
});

const PostSchema = new mongoose.Schema({
    username: String,
    note: String,
    image: String,
    createdAt: { type: Date, default: Date.now },
    comments: [CommentSchema],
    likes: [String],
    likeCount: { type: Number, default: 0 },
    tier: {
        type: String,
        enum: ['Free', 'Regular', 'Special', 'VIP'],
        default: 'Free'
    }
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
