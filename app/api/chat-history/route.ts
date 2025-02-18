import { NextResponse } from 'next/server';
import { ref, get, getDatabase } from 'firebase/database';
import { app as firebaseApp } from '@/utils/firebase';

interface Sender {
  address: string;
  username: string;
  profileImage: string;
}

interface Message {
  sender: Sender;
  text: string;
  timestamp: number;
}

interface ChatData {
  messages: Record<string, Message>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userAddress = searchParams.get('address');

  if (!userAddress) {
    return NextResponse.json({ error: 'User address required' }, { status: 400 });
  }

  try {
    const db = getDatabase(firebaseApp);
    const chatsRef = ref(db, 'chats');
    const snapshot = await get(chatsRef);

    if (!snapshot.exists()) {
      console.log('No chats found in Firebase');
      return NextResponse.json({ chatHistory: [] });
    }

    const allChats = snapshot.val();
    const chatHistory = [];

    // Iterate through all chats
    for (const [chatId, chatData] of Object.entries(allChats)) {
      const typedChatData = chatData as ChatData;
      
      // Get all messages in this chat
      const messages = typedChatData.messages ? Object.values(typedChatData.messages) : [];
      
      // Check if any message involves our user (either as sender or recipient)
      const userInvolved = messages.some(msg => 
        msg.sender.address === userAddress
      );

      if (!userInvolved) continue;

      // Get the last message
      const lastMessage = messages[messages.length - 1];
      
      // Get the other participant (from the last message)
      const otherParticipant = lastMessage.sender.address === userAddress
        ? messages.find(msg => msg.sender.address !== userAddress)?.sender
        : lastMessage.sender;

      if (!otherParticipant) continue;

      chatHistory.push({
        id: chatId,
        recipientAddress: otherParticipant.address,
        username: otherParticipant.username,
        profileImage: otherParticipant.profileImage,
        lastMessage: lastMessage.text,
        timestamp: lastMessage.timestamp || Date.now()
      });
    }

    // Sort by most recent first
    chatHistory.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    console.log('Chat History:', chatHistory); // Debugging statement

    return NextResponse.json({ chatHistory });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch chat history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}