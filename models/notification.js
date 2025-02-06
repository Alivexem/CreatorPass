import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
    recipientAddress: {
        type: String,
        required: true,
        index: true
    },
    senderAddress: {
        type: String,
        required: true
    },
    senderName: String,
    senderImage: String,
    type: {
        type: String,
        enum: ['message', 'like', 'comment'],
        default: 'message'
    },
    message: String,
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification; 