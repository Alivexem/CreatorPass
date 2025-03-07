import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import Pass from "@/models/pass";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const { address } = await request.json();

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { message: 'Invalid pass ID' },
        { status: 400 }
      );
    }

    const pass = await Pass.findOneAndDelete({
      _id: id,
      creatorAddress: address
    });

    if (!pass) {
      return NextResponse.json(
        { message: 'Pass not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting pass:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
} 