import mongoose from 'mongoose';

const passSchema = new mongoose.Schema({
  creatorAddress: { type: String, required: true },
  creatorName: { type: String, required: true },
  type: { type: String, required: true, enum: ['Regular', 'Special', 'VIP'] },
  price: { type: Number, required: true },
  message: { type: String, required: true },
  image: { type: String, required: true },
  rules: {
    funForumAccess: { type: Boolean, default: true },
    likeCommentAccess: { type: Boolean, default: true },
    downloadAccess: { type: Boolean, default: true },
    giftAccess: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Ensure one creator can only have one pass of each type
passSchema.index({ creatorAddress: 1, type: 1 }, { unique: true });

const Pass = mongoose.models.Pass || mongoose.model('Pass', passSchema);
export default Pass; 