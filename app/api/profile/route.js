import { NextResponse } from "next/server";
import connectDB from "../../../libs/mongodb";
import Profile from "../../../models/profile";

export async function POST(request) {
    try {
        await connectDB();
        const { address, username, country, about, profileImage, isAdultContent } = await request.json();
        
        if (!address) {
            return NextResponse.json({ message: 'Address is required' }, { status: 400 });
        }

        // Update profile if exists, create if it doesn't (upsert)
        const profile = await Profile.findOneAndUpdate(
            { address },
            { 
                username, 
                country, 
                about, 
                profileImage, 
                isAdultContent,
                updatedAt: new Date() 
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({ 
            message: 'Profile updated', 
            profile 
        }, { 
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
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
        return NextResponse.json({ profile }, { 
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await connectDB();
        const { address, metricType, value } = await request.json();

        if (!address || !metricType) {
            return NextResponse.json({ message: 'Address and metric type are required' }, { status: 400 });
        }

        let profile = await Profile.findOne({ address });
        if (!profile) {
            return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
        }

        switch (metricType) {
            case 'passesOwned':
                // Initialize if undefined and add the new value
                profile.passesOwned = (profile.passesOwned || 0) + value;
                break;
            case 'revenue':
                // Initialize if undefined and add the new value
                profile.revenue = (profile.revenue || 0) + value;
                break;
            case 'crtp':
                // Handle CRTP updates separately
                if (!profile.crtp) profile.crtp = 0;
                profile.crtp = Math.max(0, profile.crtp + value);
                break;
            default:
                return NextResponse.json({ message: 'Invalid metric type' }, { status: 400 });
        }

        await profile.save();

        return NextResponse.json({ 
            message: 'Profile metrics updated successfully',
            profile
        });
    } catch (error) {
        console.error('Update profile metrics error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}