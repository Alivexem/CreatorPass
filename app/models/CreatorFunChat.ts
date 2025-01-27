import mongoose from 'mongoose';

const CreatorFunChatSchema = new mongoose.Schema({
    creatorAddress: {
        type: String,
        required: true,
        index: true
    },
    chats: [{
        address: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        profileImage: {
            type: String,
            default: '/smile.jpg'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
});

export default mongoose.models.CreatorFunChat || mongoose.model('CreatorFunChat', CreatorFunChatSchema); 