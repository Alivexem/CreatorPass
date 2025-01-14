import mongoose, { Schema } from 'mongoose';

const uploadSchema = new Schema({
  username: String,
  note: String,
  image: String,
}, {
  timestamps: true, // This will add `createdAt` and `updatedAt` fields automatically
});

uploadSchema.index({ createdAt: 1 });

const Creates = mongoose.models.upload || mongoose.model('Creates', uploadSchema);

export default Creates;