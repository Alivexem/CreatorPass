import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import Pass from '@/models/pass';

export async function GET(
  request: Request,
  { params }: { params: { creatorId: string } }
) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const creatorId = params.creatorId;

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    // Find all passes where the creator matches and the user is a holder
    const passes = await Pass.find({
      creatorAddress: creatorId,
      holders: address
    });

    return NextResponse.json({ 
      success: true, 
      passes 
    });
  } catch (error) {
    console.error('Error checking pass holders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check pass holders' },
      { status: 500 }
    );
  }
}
