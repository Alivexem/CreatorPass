import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema({
    totalUsers: {
        type: Number,
        default: 0
    },
    addresses: [{
        address: {
            type: String,
            unique: true
        },
        joinDate: {
            type: Date,
            default: Date.now
        }
    }]
});

export default mongoose.models.Users || mongoose.model('Users', usersSchema);
