import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import Pass from '@/models/pass';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ message: 'Address is required' }, { status: 400 });
    }

    const passes = await Pass.find({ creatorAddress: address });
    return NextResponse.json({ passes });
  } catch (error: any) {
    console.error('Error fetching passes:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { address, creatorName, type, price, message, image, rules } = await request.json();

    // Check if user already has this type of pass
    const existingPass = await Pass.findOne({
      creatorAddress: address,
      type: type
    });

    if (existingPass) {
      return NextResponse.json({ 
        success: false, 
        error: `You already have a ${type} pass` 
      }, { status: 400 });
    }

    // Check total number of passes
    const totalPasses = await Pass.countDocuments({ creatorAddress: address });
    if (totalPasses >= 3) {
      return NextResponse.json({ 
        success: false, 
        error: 'Maximum number of passes (3) reached' 
      }, { status: 400 });
    }

    const pass = await Pass.create({
      creatorAddress: address,
      creatorName,
      type,
      price,
      message,
      image,
      rules
    });

    return NextResponse.json({ success: true, pass });
  } catch (error: any) {
    console.error('Error creating pass:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 