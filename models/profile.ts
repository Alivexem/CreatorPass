import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        default: 'Anonymous'
    },
    country: String,
    about: String,
    profileImage: String,
    isAdultContent: {
        type: Boolean,
        default: false
    },
    // New fields for stats
    passesMinted: {
        type: Number,
        default: 0
    },
    revenue: {
        type: Number,
        default: 0
    },
    crtp: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

export default Profile;
