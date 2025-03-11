import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import Pass from '@/models/pass';

export async function POST(
  request: Request,
  { params }: { params: { passId: string } }
) {
  try {
    await connectDB();
    const { holderAddress } = await request.json();
    const passId = params.passId;

    const result = await Pass.findByIdAndUpdate(
      passId,
      { 
        $addToSet: { holders: holderAddress }
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Pass not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Holder added successfully',
      holders: result.holders 
    });
  } catch (error) {
    console.error('Error updating pass holders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update pass holders' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { passId: string } }
) {
  try {
    await connectDB();
    const passId = params.passId;

    const pass = await Pass.findById(passId).select('holders');

    if (!pass) {
      return NextResponse.json(
        { success: false, error: 'Pass not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      holders: pass.holders 
    });
  } catch (error) {
    console.error('Error fetching pass holders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pass holders' },
      { status: 500 }
    );
  }
}
