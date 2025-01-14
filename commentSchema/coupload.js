import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

commentSchema.index({ createdAt: 1 });
  

const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

export default Comment;