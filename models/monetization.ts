import mongoose from 'mongoose';

const monetizationSchema = new mongoose.Schema({
    _id: String,
    account: String
});

export default mongoose.models.Monetization || mongoose.model('Monetization', monetizationSchema);
