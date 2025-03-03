import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import Pass from '@/models/Pass';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const creatorAddress = searchParams.get('creator');
    const userAddress = searchParams.get('user');

    if (!creatorAddress || !userAddress) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const passes = await Pass.find({
      address: creatorAddress,
      'owners.address': userAddress
    });

    const hasPass = passes.length > 0;
    const passCategories = passes.map(pass => pass.category);

    return NextResponse.json({
      hasPass,
      passCategories,
      hasFreeContent: await Pass.exists({
        address: creatorAddress,
        'posts.category': 'free'
      })
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check pass ownership' }, { status: 500 });
  }
} 