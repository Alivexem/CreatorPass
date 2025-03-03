import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import mongoose from "mongoose";

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json({ message: 'Address is required' }, { status: 400 });
        }

        const db = mongoose.connection.db!;
        const passes = await db.collection('passes').find({ address }).toArray();
        const totalPasses = passes.length;

        const earnings = await db.collection('earnings').findOne({ creatorAddress: address });
        const totalRevenue = earnings?.totalEarned || 0;

        let topPass = null;
        if (passes.length > 0) {
            const sortedPasses = passes.sort((a, b) => b.mintCount - a.mintCount);
            topPass = {
                category: sortedPasses[0].category,
                mintCount: sortedPasses[0].mintCount
            };
        }

        return NextResponse.json({ 
            stats: {
                totalPasses,
                totalRevenue,
                topPass
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 });
    }
} 