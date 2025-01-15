import mongoose, { Schema } from 'mongoose';

const uploadSchema = new Schema({
  username: String,
  note: String,
  image: String,
}, {
  timestamps: true
});

uploadSchema.index({ createdAt: 1 });

const Creates = mongoose.models.Creates || mongoose.model('Creates', uploadSchema);

export default Creates;