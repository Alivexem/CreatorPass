import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { buyerAddress, price } = await request.json();
    const db = mongoose.connection.db!;
    
    // Update pass mint count
    await db.collection('passes').updateOne(
      { _id: new ObjectId(params.id) },
      { $inc: { mintCount: 1 } }
    );
    
    // Record earnings
    const pass = await db.collection('passes').findOne({ _id: new ObjectId(params.id) });
    if (!pass) throw new Error('Pass not found');

    await db.collection('earnings').insertOne({
      passId: params.id,
      creatorAddress: pass.address,
      buyerAddress,
      price,
      timestamp: new Date().toISOString(),
    });
    
    // Update total earnings
    await db.collection('earnings').updateOne(
      { creatorAddress: pass.address },
      { 
        $inc: { totalEarned: price },
        $setOnInsert: { createdAt: new Date().toISOString() }
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record mint' }, { status: 500 });
  }
} 