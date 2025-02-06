import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import Notification from "@/models/notification";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 });
        }

        const notifications = await Notification.find({ recipientAddress: address })
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({ notifications });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectDB();
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
        }

        await Notification.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Notification deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }
} 