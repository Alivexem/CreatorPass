import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (mongoose.connections[0].readyState) {
            console.log('Already connected to MongoDB');
            return;
        }

        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4
        });
        console.log('Successfully connected to MongoDB');
    } catch (error) {
        console.error('Detailed MongoDB connection error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

export default connectDB;