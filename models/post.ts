import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
    address: String,
    username: String,
    profileImage: String,
    comment: String,
    timestamp: { type: Date, default: Date.now },
    likes: [String],
    likeCount: { type: Number, default: 0 }
});

const CommentSchema = new mongoose.Schema({
    address: String,
    username: String,
    profileImage: String,
    comment: String,
    timestamp: { type: Date, default: Date.now },
    likes: [String],
    likeCount: { type: Number, default: 0 },
    replies: [ReplySchema],
    hasReplies: { type: Boolean, default: false }
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
