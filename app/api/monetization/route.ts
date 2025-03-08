import connectDB from "@/libs/mongodb";
import { NextResponse } from 'next/server';
import monetization from '@/models/monetization'; // You'll need to create this model

// Connect to MongoDB once for the module
await connectDB();

export async function GET() {
    try {
        const money = await monetization.findOne({
            _id: "67c57a753756f665413fef96"
        });

        if (!money) {
            return new NextResponse(
                JSON.stringify({ error: 'Monetization address not found' }),
                { status: 404 }
            );
        }

        return new NextResponse(
            JSON.stringify({ address: money.account }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching monetization address:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to fetch monetization address' }),
            { status: 500 }
        );
    }
}
