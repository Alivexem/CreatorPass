import mongoose, { Schema } from 'mongoose';

interface PassOwner {
  address: string;
  mintedAt: Date;
}

const PassSchema = new Schema({
  category: {
    type: String,
    required: true,
    enum: ['Bronze', 'Silver', 'Gold']
  },
  price: {
    type: Number,
    required: true
  },
  expirationDays: {
    type: Number,
    default: null
  },
  address: {
    type: String,
    required: true
  },
  ownerUsername: String,
  ownerImage: String,
  imageUrl: String,
  mintCount: {
    type: Number,
    default: 0
  },
  owners: [{
    address: String,
    mintedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Pass || mongoose.model('Pass', PassSchema); 