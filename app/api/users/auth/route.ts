import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import Users from '@/models/users';

export async function POST(request: NextRequest) {
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
        const addressExists = usersDoc.addresses.includes(address);
        
        if (!addressExists) {
            // Add new address and increment count
            usersDoc.addresses.push(address);
            usersDoc.totalUsers += 1;
            await usersDoc.save();
        }

        return NextResponse.json({ 
            success: true, 
            totalUsers: usersDoc.totalUsers,
            isNewUser: !addressExists
        });
    } catch (error: any) {
        console.error('User auth error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
