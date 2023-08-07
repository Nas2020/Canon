import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'your_default_mongodb_uri';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

export async function connectToDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, {
            bufferCommands: true,
            autoIndex: true,
            autoCreate: true
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}
