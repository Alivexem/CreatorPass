import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    const db = mongoose.connection.db!;
    const query = address ? { address } : {};
    const passes = await db.collection('passes').find(query).toArray();
    
    return NextResponse.json({ passes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch passes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { category, price, hasExpiration, expirationDays, address, ownerUsername, ownerImage, imageUrl } = body;
    
    const db = mongoose.connection.db!;
    const result = await db.collection('passes').insertOne({
      category,
      price,
      expirationDays: hasExpiration ? expirationDays : null,
      address,
      ownerUsername,
      ownerImage,
      imageUrl,
      mintCount: 0,
      createdAt: new Date().toISOString(),
    });
    
    return NextResponse.json({ success: true, passId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create pass' }, { status: 500 });
  }
} 