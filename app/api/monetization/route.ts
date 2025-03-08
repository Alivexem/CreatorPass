import connectDB from "@/libs/mongodb";
import { NextResponse } from 'next/server';
import monetization from '@/models/monetization';

// Fallback address in case database fails
const FALLBACK_ADDRESS = "3v7rE4hWTKi8vswPg8VbjGLJt9DeNNDG15dMuSHTX6Ev";

// Connect to MongoDB once for the module
await connectDB();

export async function GET() {
    try {
        const money = await monetization.findOne();
        
        let address = money?.account || FALLBACK_ADDRESS;
        // Ensure address is correct length
        address = address.substring(0, 44);

        return new NextResponse(
            JSON.stringify({ address }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching monetization address:', error);
        return new NextResponse(
            JSON.stringify({ address: FALLBACK_ADDRESS }),
            { status: 200 }
        );
    }
}
