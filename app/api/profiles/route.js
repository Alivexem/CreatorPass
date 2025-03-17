import { NextResponse } from "next/server";
import connectDB from "../../../libs/mongodb";
import Profile from "../../../models/profile";

export async function GET() {
    try {
        await connectDB();
        const profiles = await Profile.find({}).select({
            address: 1,
            username: 1,
            about: 1,
            profileImage: 1,
            isAdultContent: 1,
            country: 1,
            _id: 0
        }).lean();

        return NextResponse.json({ profiles }, { 
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, private',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store'
            }
        });
    } catch (error) {
        console.error('Get profiles error:', error);
        return NextResponse.json({ 
            message: error.message 
        }, { status: 500 });
    }
}
