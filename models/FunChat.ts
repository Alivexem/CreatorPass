import mongoose from 'mongoose';

const funChatSchema = new mongoose.Schema({
    creatorId: { type: String, required: true },
    address: { type: String, required: true },
    username: { type: String, required: true },
    profileImage: { type: String },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.FunChat || mongoose.model('FunChat', funChatSchema);
