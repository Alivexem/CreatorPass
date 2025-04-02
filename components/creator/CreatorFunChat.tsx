'use client'
import { useRef, useState, useEffect } from 'react';
import { IoFlash } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import Image from 'next/image';
import { FunChat } from '@/types/creator';
import { useRouter } from 'next/navigation';
import { getDatabase, ref, push, onValue, query, orderByChild } from 'firebase/database';
import { app } from '@/utils/firebase';

interface CreatorFunChatProps {
    showFunChat: boolean;
    setShowFunChat: (show: boolean) => void;
    funChats: FunChat[];
    onSendChat: (message: string) => Promise<void>;
    profileUsername?: string;
    creatorId: string;
    disabled?: boolean;  // Add this back
    restrictionMessage?: string;
    userProfile?: {
        username: string;
        profileImage: string;
    };
    userAddress: string;
}

const CreatorFunChat = ({ 
    showFunChat, 
    setShowFunChat, 
    funChats: initialFunChats, 
    onSendChat,
    profileUsername,
    creatorId,
    disabled = false,  // Add default value
    restrictionMessage,
    userProfile,
    userAddress
}: CreatorFunChatProps) => {
    const [funChatMessage, setFunChatMessage] = useState('');
    const [funChats, setFunChats] = useState(initialFunChats);
    const chatRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const database = getDatabase(app);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const formRef = useRef<HTMLFormElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        // Set up realtime listener for fun chats
        const chatRef = ref(database, `funChats/${creatorId}`);
        const chatsQuery = query(chatRef, orderByChild('timestamp'));

        const unsubscribe = onValue(chatsQuery, (snapshot) => {
            const chatsData = snapshot.val();
            if (chatsData) {
                const chatsList = Object.entries(chatsData).map(([id, data]: [string, any]) => ({
                    id,
                    ...data,
                }));
                setFunChats([...chatsList].reverse());
            }
        });

        return () => unsubscribe();
    }, [creatorId]);

    useEffect(() => {
        if (chatRef.current) {
            // Ensure scroll to bottom happens after content is rendered
            setTimeout(() => {
                chatRef.current?.scrollTo({
                    top: chatRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }, [funChats]);

    useEffect(() => {
        // Detect keyboard visibility changes
        const initialHeight = window.innerHeight;
        
        const handleResize = () => {
            const currentHeight = window.innerHeight;
            if (initialHeight > currentHeight) {
                // Keyboard is shown
                const difference = initialHeight - currentHeight;
                setKeyboardHeight(difference);
                setIsKeyboardVisible(true);
            } else {
                // Keyboard is hidden
                setKeyboardHeight(0);
                setIsKeyboardVisible(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSendFunChat = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!funChatMessage.trim()) return;

        const chatRef = ref(database, `funChats/${creatorId}`);
        const newChat = {
            message: funChatMessage.trim(),
            timestamp: Date.now(),
            username: userProfile?.username || 'Anonymous',
            address: userAddress,
            profileImage: userProfile?.profileImage || '/empProfile.png'
        };

        try {
            await push(chatRef, newChat);
            setFunChatMessage('');
        } catch (error) {
            console.error('Error sending fun chat:', error);
        }
    };

    const handleProfileClick = (address: string) => {
        router.push(`/creators?highlight=${address}`);
    };

    const renderChatMessage = (message: string) => {
        const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
        const linkifiedContent = message.split(urlRegex).map((part, i) => {
            if (part.match(urlRegex)) {
                return `<a href="${part}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${part}</a>`;
            }
            return part;
        }).join('');

        return (
            <div 
                className="text-white text-sm break-words"
                dangerouslySetInnerHTML={{ __html: linkifiedContent }}
            />
        );
    };

    const shouldShowRestriction = creatorId !== userAddress && restrictionMessage;

    return (
        <>
            {/* Mobile Fun Chat Toggle */}
            {!showFunChat && (
                <div className="md:hidden fixed left-4 bottom-[11vh] transform -translate-y-1/2 z-40 md:z-0">
                    <button
                        onClick={() => setShowFunChat(true)}
                        className="bg-indigo-600 animate bounce p-3 rounded-full shadow-lg"
                    >
                        <IoFlash className="text-white text-lg" />
                    </button>
                </div>
            )}

            {/* Fun Chat Section */}
            <div className={`fixed top-[44%] z-50 md:z-0 md:top-[55vh] transform -translate-y-1/2 left-0 md:left-10 h-[88vh] md:h-[70vh] md:w-[400px] w-full 
                bg-gradient-to-b from-gray-600 to-gray-800
                ${showFunChat ? 'translate-x-0' : 'md:translate-x-0 -translate-x-full'} 
                transition-transform duration-300 z-30 shadow-xl md:rounded-r-lg`}
                style={
                    isMobile
                        ? isKeyboardVisible
                            ? { height: `calc(100vh - ${keyboardHeight}px)` }
                            : undefined
                        : undefined
                }
            >
                <div className="p-4 h-full flex flex-col bg-black/30 md:bg-transparent">
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setShowFunChat(false)}
                        className="md:hidden absolute top-4 right-4 text-white"
                    >
                        <IoMdClose size={24} />
                    </button>

                    {/* Chat Header */}
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-xl font-bold text-white">
                            {profileUsername}'s Room Chat
                        </h2>
                        <IoFlash className="text-white text-xl" />
                    </div>

                    {/* Chat Messages - Always visible regardless of permissions */}
                    <div
                        ref={chatRef}
                        className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2"
                        style={{
                            height: isKeyboardVisible ? `calc(100% - ${keyboardHeight}px)` : 'auto'
                        }}
                    >
                        {funChats.map((chat, index) => (
                            <div key={chat.timestamp + index} className="flex items-start gap-2 bg-white/5 p-2 rounded-lg">
                                <Image
                                    src={chat.profileImage || '/empProfile.png'}
                                    alt="Profile"
                                    width={32}
                                    height={32}
                                    className="rounded-full h-[40px] w-[40px] object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleProfileClick(chat.address)}
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="text-blue-200 text-xs">
                                            {chat.username || 'Anonymous'}
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                            {new Date(chat.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    {renderChatMessage(chat.message)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat Input - Only disabled when user doesn't have permission */}
                    <form 
                        ref={formRef}
                        onSubmit={handleSendFunChat} 
                        className={`mt-auto ${
                            isKeyboardVisible 
                                ? 'fixed bottom-0 left-0 right-0 md:relative bg-gray-800 p-4' 
                                : 'relative'
                        }`}
                        style={{
                            position: isKeyboardVisible ? 'fixed' : 'relative',
                            bottom: isKeyboardVisible ? `${keyboardHeight}px` : 'auto',
                            transform: 'translateZ(0)', // Force hardware acceleration
                        }}
                    >
                        {shouldShowRestriction ? (
                            <div className="mb-2 text-sm text-red-400">
                                {restrictionMessage}
                            </div>
                        ) : null}
                        <input
                            type="text"
                            value={funChatMessage}
                            onChange={(e) => setFunChatMessage(e.target.value)}
                            placeholder={shouldShowRestriction ? "Get a pass to unlock chat" : "Type your message..."}
                            className={`w-full bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50 ${
                                shouldShowRestriction ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={!!shouldShowRestriction}
                        />
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreatorFunChat;
