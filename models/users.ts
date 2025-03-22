import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema({
    totalUsers: {
        type: Number,
        default: 0
    },
    addresses: [{
        type: String,
        unique: true
    }]
});

export default mongoose.models.Users || mongoose.model('Users', usersSchema);
