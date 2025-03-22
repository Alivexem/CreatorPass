import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import Users from '@/models/users';

export async function POST(request) {
    try {
        await connectDB();
        const { address } = await request.json();

        if (!address) {
            return NextResponse.json({ 
                success: false, 
                error: 'Address is required' 
            }, { status: 400 });
        }

        // Get or create the users document
        let usersDoc = await Users.findOne({});
        if (!usersDoc) {
            usersDoc = new Users({ totalUsers: 0, addresses: [] });
        }

        // Check if address already exists
        const addressExists = usersDoc.addresses.some(entry => entry.address === address);
        
        if (!addressExists) {
            // Add new address with timestamp and increment count
            usersDoc.addresses.push({
                address: address,
                joinDate: new Date()
            });
            usersDoc.totalUsers += 1;
            await usersDoc.save();
        }

        return NextResponse.json({ 
            success: true, 
            totalUsers: usersDoc.totalUsers,
            isNewUser: !addressExists
        });
    } catch (error) {
        console.error('User auth error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const usersDoc = await Users.findOne({});
        
        return NextResponse.json({ 
            success: true,
            users: usersDoc?.addresses || []
        });
    } catch (error) {
        console.error('User fetch error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
