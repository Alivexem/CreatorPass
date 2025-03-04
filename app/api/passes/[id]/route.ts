import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const db = mongoose.connection.db!;
    await db.collection('passes').deleteOne({ _id: new ObjectId(params.id) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete pass' }, { status: 500 });
  }
} 