import connectDB from "@/libs/mongodb";
import { NextResponse } from 'next/server';
import monetization from '@/models/monetization';

// Fallback address in case database fails
const FALLBACK_ADDRESS = "3v7rE4hWTKi8vswPg8VbjGLJt9DeNNDG15dMuSHTX6Ev3v7rE4hWTKi8vswPg8VbjGLJt9DeNNDG15dMuSHTX6Ev";

// Connect to MongoDB once for the module
await connectDB();

export async function GET() {
    try {
        // Instead of looking for a specific ID, just get the first record
        const money = await monetization.findOne();

        // If no record found in DB, use fallback
        if (!money) {
            console.log('No monetization record found, using fallback address');
            return new NextResponse(
                JSON.stringify({ address: FALLBACK_ADDRESS }),
                { status: 200 }
            );
        }

        return new NextResponse(
            JSON.stringify({ address: money.account }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching monetization address:', error);
        // On any error, return the fallback address
        return new NextResponse(
            JSON.stringify({ address: FALLBACK_ADDRESS }),
            { status: 200 }
        );
    }
}
