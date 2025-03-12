'use client'
import { useRef, useState } from 'react';
import { IoFlash } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import Image from 'next/image';
import { FunChat } from '@/types/creator';

interface CreatorFunChatProps {
    showFunChat: boolean;
    setShowFunChat: (show: boolean) => void;
    funChats: FunChat[];
    onSendChat: (message: string) => Promise<void>;
    profileUsername?: string;
}

const CreatorFunChat = ({ 
    showFunChat, 
    setShowFunChat, 
    funChats, 
    onSendChat,
    profileUsername 
}: CreatorFunChatProps) => {
    const [funChatMessage, setFunChatMessage] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);

    const handleSendFunChat = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!funChatMessage.trim()) return;

        await onSendChat(funChatMessage.trim());
        setFunChatMessage('');
        
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    };

    return (
        <>
            {/* Mobile Fun Chat Toggle */}
            {!showFunChat && (
                <div className="md:hidden fixed left-4 bottom-[10vh] transform -translate-y-1/2 z-40">
                    <button
                        onClick={() => setShowFunChat(true)}
                        className="bg-indigo-600 animate bounce p-3 rounded-full shadow-lg"
                    >
                        <IoFlash className="text-white text-xl" />
                    </button>
                </div>
            )}

            {/* Fun Chat Section */}
            <div className={`fixed top-1/2 md:top-[55vh] transform -translate-y-1/2 left-0 md:left-10 h-[65vh] md:h-[70vh] md:w-[400px] w-full 
                bg-gradient-to-b from-gray-600 to-gray-800
                ${showFunChat ? 'translate-x-0' : 'md:translate-x-0 -translate-x-full'} 
                transition-transform duration-300 z-30 shadow-xl rounded-r-lg`}
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
                            {profileUsername}'s Fun Talk
                        </h2>
                        <IoFlash className="text-white text-xl" />
                    </div>

                    {/* Chat Messages */}
                    <div
                        ref={chatRef}
                        className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2"
                    >
                        {funChats.map((chat, index) => (
                            <div key={index} className="flex items-start gap-2 bg-white/5 p-2 rounded-lg">
                                <Image
                                    src={chat.profileImage || '/empProfile.png'}
                                    alt="Profile"
                                    width={32}
                                    height={32}
                                    className="rounded-full h-[40px] w-[40px] object-cover"
                                />
                                <div>
                                    <p className="text-blue-200 text-xs">
                                        {chat.username || 'Anonymous'}
                                    </p>
                                    <p className="text-white text-sm">{chat.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendFunChat} className="mt-auto">
                        <input
                            type="text"
                            value={funChatMessage}
                            onChange={(e) => setFunChatMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                        />
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreatorFunChat;
