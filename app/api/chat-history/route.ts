import { NextResponse } from 'next/server';
import { ref, get, getDatabase, query, orderByChild } from 'firebase/database';
import { app as firebaseApp } from '@/utils/firebase';

interface Message {
  text: string;
  sender: string;
  timestamp: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userAddress = searchParams.get('address');

  try {
    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }

    const db = getDatabase(firebaseApp);

    // Get all profiles for username lookup
    const profilesRef = ref(db, 'profiles');
    const profilesSnapshot = await get(profilesRef);
    const profiles = profilesSnapshot.val() || {};

    // Get chats using the same structure as CreatorChat
    const chatsRef = ref(db, 'chats');
    const chatsSnapshot = await get(chatsRef);
    const chats = chatsSnapshot.val() || {};

    const userChats = [];

    // Process each chat room using CreatorChat's structure
    for (const chatId in chats) {
      const chat = chats[chatId];
      
      // Check if user is part of this chat using participants array
      if (chat.participants && chat.participants.includes(userAddress)) {
        const messages = chat.messages ? Object.values(chat.messages) : [];
        if (messages.length > 0) {
          // Get the other participant (creator)
          const otherParticipant = chat.participants.find((p: string) => p !== userAddress);
          const participantInfo = chat.participantsInfo?.[otherParticipant] || {};
          const lastMessage = messages[messages.length - 1] as Message;

          userChats.push({
            id: chatId,
            recipientAddress: otherParticipant,
            username: participantInfo.username || profiles[otherParticipant]?.username || 'Unknown User',
            profileImage: participantInfo.profileImage || profiles[otherParticipant]?.profileImage || '/empProfile.png',
            lastMessage: lastMessage.text,
            timestamp: new Date(lastMessage.timestamp).toISOString()
          });
        }
      }
    }

    // Sort by most recent message
    const sortedChats = userChats.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ chatHistory: sortedChats });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
