import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import Pass from '@/models/pass';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    let passes;
    if (address) {
      // If address is provided, fetch passes for that creator
      passes = await Pass.find({ creatorAddress: address });
    } else {
      // If no address, fetch all passes
      passes = await Pass.find({});
    }

    return NextResponse.json({ success: true, passes });
  } catch (error) {
    console.error('Error in GET /api/passes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch passes' },
      { status: 500 }
    );
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