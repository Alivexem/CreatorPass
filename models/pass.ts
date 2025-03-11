import mongoose from 'mongoose';

const passSchema = new mongoose.Schema({
  creatorAddress: {
    type: String,
    required: true,
  },
  creatorName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Regular', 'Special', 'VIP'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  rules: {
    funForumAccess: Boolean,
    likeCommentAccess: Boolean,
    downloadAccess: Boolean,
    giftAccess: Boolean,
  },
  holders: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Pass || mongoose.model('Pass', passSchema);