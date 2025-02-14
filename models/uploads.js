import mongoose, { Schema } from 'mongoose';

const uploadSchema = new Schema({
  username: String,
  note: String,
  image: String,
  likes: {
    type: [String],
    default: []
  },
  likeCount: {
    type: Number,
    default: 0
  },
  comments: {
    type: [{
      address: String,
      comment: String,
      timestamp: Date
    }],
    default: []
  }
}, {
  timestamps: true
});

uploadSchema.index({ createdAt: 1 });

const Creates = mongoose.models.Creates || mongoose.model('Creates', uploadSchema);

export default Creates;