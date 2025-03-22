import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb';
import monetization from '@/models/monetization';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { password } = await request.json();
    
    const money = await monetization.findOne();
    if (!money) {
      // Fallback to hardcoded password if config not found
      const fallbackPassword = "3v7rE4hWTKi8vswPg8VbjGLJt9DeNNDG15dMuSHTX6Ev";
      const isValid = password === fallbackPassword;
      return NextResponse.json({ success: isValid });
    }

    const isValid = password === money.account;
    
    return NextResponse.json({ 
      success: isValid 
    });

  } catch (error) {
    console.error('Auth validation error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Invalid request' 
    }, { status: 400 });
  }
}
