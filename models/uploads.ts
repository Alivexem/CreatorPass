import mongoose from 'mongoose';

const uploadsSchema = new mongoose.Schema({
    username: { type: String, required: true },
    note: { type: String, required: true },
    image: { type: String },
    tier: { 
        type: String, 
        enum: ['Free', 'Regular', 'Special', 'VIP'],
        default: 'Free',
        required: true 
    },
    likes: [{ type: String }],
    likeCount: { type: Number, default: 0 },
    comments: [{
        address: String,
        comment: String,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

const Creates = mongoose.models.Creates || mongoose.model('Creates', uploadsSchema);

export default Creates;
