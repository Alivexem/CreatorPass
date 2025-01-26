import mongoose, { Schema } from 'mongoose';

const worldChatSchema = new Schema({
    address: String,
    message: String,
    profileImage: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const WorldChat = mongoose.models.WorldChat || mongoose.model('WorldChat', worldChatSchema);

export default WorldChat; 