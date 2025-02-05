import { NextResponse } from "next/server";
import connectDB from "../../../libs/mongodb";
import Profile from "../../../models/profile";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        await connectDB();
        const profiles = await Profile.find({})
            .select('address username about profileImage')
            .sort({ createdAt: -1 });
        
        return new NextResponse(JSON.stringify({ profiles }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '-1',
                'Surrogate-Control': 'no-store',
            }
        });
    } catch (error) {
        console.error('Get profiles error:', error);
        return new NextResponse(JSON.stringify({ message: 'Error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '-1',
                'Surrogate-Control': 'no-store',
            }
        });
    }
} 