import mongoose from 'mongoose';

const uploadsSchema = new mongoose.Schema({
    username: { type: String, required: true },
    note: { type: String, required: true },
    image: { type: String },
    video: { type: String }, // Add video field
    audio: { type: String }, // Added audio field to support audio uploads
    mediaType: { 
        type: String,
        enum: ['image', 'video', 'audio'], // Added 'audio' as a valid enum value
    },
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
        imageUrl: String,
        timestamp: { type: Date, default: Date.now },
        likes: [{ type: String }],  // Add likes array
        likeCount: { type: Number, default: 0 }  // Add likeCount
    }],
    createdAt: { type: Date, default: Date.now }
});

const Creates = mongoose.models.Creates || mongoose.model('Creates', uploadsSchema);

export default Creates;
