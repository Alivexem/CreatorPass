import { NextResponse } from "next/server";
import connectDB from "../../../libs/mongodb";
import Profile from "../../../models/profile";

export async function POST(request) {
    try {
        await connectDB();
        const { address, username, country, about, profileImage } = await request.json();
        
        if (!address) {
            return NextResponse.json({ message: 'Address is required' }, { status: 400 });
        }

        // Update profile if exists, create if it doesn't (upsert)
        const profile = await Profile.findOneAndUpdate(
            { address },
            { username, country, about, profileImage },
            { new: true, upsert: true }
        );

        return NextResponse.json({ 
            message: 'Profile updated', 
            profile 
        }, { status: 200 });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ 
            message: `Error: ${error.message}` 
        }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json({ message: 'Address is required' }, { status: 400 });
        }

        const profile = await Profile.findOne({ address });
        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
} 