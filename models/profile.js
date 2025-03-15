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
    },
    metrics: {
        passesOwned: {
            type: Number,
            default: 0
        },
        revenueGenerated: {
            type: Number,  // Store in lamports
            default: 0
        },
        crtpPoints: {
            type: Number,
            default: 0
        },
        totalPasses: {
            type: Number,
            default: 0
        }
    }
});

// Add methods to handle metric updates
profileSchema.methods.updatePassesOwned = async function(count) {
    this.metrics.passesOwned = count;
    return this.save();
};

profileSchema.methods.addRevenue = async function(amount) {
    this.metrics.revenueGenerated += amount;
    return this.save();
};

profileSchema.methods.updateCRTP = async function(action) {
    const CRTP_PER_ACTION = 75;
    this.metrics.crtpPoints += action === 'like' ? CRTP_PER_ACTION : -CRTP_PER_ACTION;
    return this.save();
};

profileSchema.methods.updateTotalPasses = async function(count) {
    this.metrics.totalPasses = count;
    return this.save();
};

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

export default Profile;