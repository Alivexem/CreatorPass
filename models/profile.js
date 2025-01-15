import mongoose, { Schema } from 'mongoose';

const profileSchema = new Schema({
    address: {
        type: String,
        required: true,
        unique: true,  // Ensures each address can only have one profile
    },
    username: {
        type: String,
        default: 'Anonymous'
    },
    country: String,
    about: String,
    profileImage: String,
}, {
    timestamps: true
});

profileSchema.index({ address: 1 });

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

export default Profile; 