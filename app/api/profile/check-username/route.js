import { NextResponse } from "next/server";
import connectDB from "../../../../libs/mongodb";
import Profile from "../../../../models/profile";

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');
        const currentAddress = searchParams.get('address');

        if (!username) {
            return NextResponse.json({ message: 'Username is required' }, { status: 400 });
        }

        const profile = await Profile.findOne({ 
            username: { $regex: new RegExp(`^${username}$`, 'i') },
            address: { $ne: currentAddress }
        });

        return NextResponse.json({ 
            exists: !!profile 
        });
    } catch (error) {
        console.error('Check username error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
