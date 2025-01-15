import { NextResponse } from "next/server";
import connectDB from "../../../libs/mongodb";
import Profile from "../../../models/profile";

export async function GET() {
    try {
        await connectDB();
        const profiles = await Profile.find({}).select('address username about profileImage');
        
        return NextResponse.json({ 
            profiles 
        });
    } catch (error) {
        console.error('Get profiles error:', error);
        return NextResponse.json({ 
            message: 'Error' 
        }, { status: 500 });
    }
} 