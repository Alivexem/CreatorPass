import mongoose, { Schema } from 'mongoose';

const PostSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  note: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['free', 'bronze', 'silver', 'gold'],
    required: true
  },
  mediaType: {
    type: String,
    enum: ['none', 'image', 'video'],
    default: 'none'
  },
  mediaUrl: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  likes: [{
    type: String
  }],
  comments: [{
    address: String,
    username: String,
    profileImage: String,
    text: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  gifts: [{
    from: String,
    amount: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema); 