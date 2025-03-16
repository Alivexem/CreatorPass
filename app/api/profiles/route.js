import { NextResponse } from "next/server";
import connectDB from "../../../libs/mongodb";
import Profile from "../../../models/profile";

export async function GET() {
    try {
        await connectDB();
        
        // Fetch all profiles with all fields explicitly selected
        const profiles = await Profile.find({}).select({
            address: 1,
            username: 1,
            about: 1,
            profileImage: 1,
            isAdultContent: 1, // Make sure these fields are included
            country: 1,
            _id: 0
        });

        return NextResponse.json({ profiles }, {
            headers: {
                'Cache-Control': 'no-store, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    } catch (error) {
        console.error('Get profiles error:', error);
        return NextResponse.json({ 
            message: error.message 
        }, { status: 500 });
    }
}
