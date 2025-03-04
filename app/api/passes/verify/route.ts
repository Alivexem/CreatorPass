import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import Pass from '@/models/Pass';

interface PassOwner {
  address: string;
  mintedAt: Date;
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('user');
    const creatorAddress = searchParams.get('creator');
    const category = searchParams.get('category');

    if (!userAddress || !creatorAddress) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const query: any = {
      address: creatorAddress,
      'owners.address': userAddress
    };

    if (category) {
      query.category = category;
    }

    const passes = await Pass.find(query);
    
    return NextResponse.json({
      hasPass: passes.length > 0,
      passes: passes.map(pass => ({
        category: pass.category,
        mintedAt: pass.owners.find((owner: PassOwner) => owner.address === userAddress)?.mintedAt
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify pass ownership' }, { status: 500 });
  }
} 