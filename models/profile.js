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

// CRTP point constants
const CRTP_POINTS = {
    POST_CREATE: 35,
    POST_DELETE: -35,
    LIKE: 15,
    UNLIKE: -15,
    PASS_MINT: 100
};

// Add methods to handle metric updates
profileSchema.methods.updatePassesOwned = async function(count) {
    try {
        // Increment the count instead of overwriting
        this.metrics.passesOwned += count;
        await this.save();
        return true;
    } catch (error) {
        console.error('Error updating passes owned:', error);
        return false;
    }
};

profileSchema.methods.addRevenue = async function(amount) {
    try {
        // Convert amount to lamports and add to existing revenue
        const revenueInLamports = Math.floor(amount * 1000000000); // Convert SOL to lamports
        this.metrics.revenueGenerated += revenueInLamports;
        await this.save();
        return true;
    } catch (error) {
        console.error('Error updating revenue:', error);
        return false;
    }
};

// Update method to handle all CRTP point actions
profileSchema.methods.updateCRTP = async function(action) {
    try {
        const points = CRTP_POINTS[action] || 0;
        this.metrics.crtpPoints += points;
        await this.save();
        return true;
    } catch (error) {
        console.error('Error updating CRTP points:', error);
        return false;
    }
};

profileSchema.methods.updateTotalPasses = async function(count) {
    this.metrics.totalPasses = count;
    return this.save();
};

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

export default Profile;