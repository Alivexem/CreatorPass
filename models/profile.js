import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
    address: { 
        type: String, 
        required: true, 
        unique: true 
    },
    username: { 
        type: String, 
        required: true 
    },
    country: { 
        type: String, 
        required: true 
    },
    about: { 
        type: String, 
        required: true 
    },
    profileImage: { 
        type: String, 
        required: true 
    },
    isAdultContent: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

export default Profile;