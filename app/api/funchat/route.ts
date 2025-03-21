import { NextResponse } from 'next/server';
import { ref, get, getDatabase, push } from 'firebase/database';
import { app as firebaseApp } from '@/utils/firebase';

interface FunChatMessage {
  message: string;
  timestamp: number;
  username: string;
  address: string;
  profileImage: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get('creatorId');

  if (!creatorId) {
    return NextResponse.json({ error: 'Creator ID required' }, { status: 400 });
  }

  try {
    const db = getDatabase(firebaseApp);
    const funChatsRef = ref(db, `funChats/${creatorId}`);
    const snapshot = await get(funChatsRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ chats: [] });
    }

    const chatsData = snapshot.val();
    const chatsList = Object.entries(chatsData).map(([id, data]) => ({
      id,
      ...(data as FunChatMessage)
    }));

    // Sort by timestamp in descending order
    chatsList.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ chats: chatsList });

  } catch (error) {
    console.error('Error fetching fun chats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch fun chats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { creatorId, message, username, address, profileImage } = await request.json();

    if (!creatorId || !message || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDatabase(firebaseApp);
    const funChatsRef = ref(db, `funChats/${creatorId}`);

    const newChat = {
      message,
      timestamp: Date.now(),
      username: username || 'Anonymous',
      address,
      profileImage: profileImage || '/empProfile.png'
    };

    const newChatRef = await push(funChatsRef, newChat);
    
    return NextResponse.json({ 
      success: true, 
      chatId: newChatRef.key,
      chat: newChat 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating fun chat:', error);
    return NextResponse.json({ 
      error: 'Failed to create fun chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
