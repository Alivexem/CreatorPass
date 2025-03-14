import React from 'react';

interface ChatMessageProps {
    message: string;
    isOwn?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwn }) => {
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
    const linkifiedContent = message.split(urlRegex).map((part, i) => {
        if (part.match(urlRegex)) {
            return `<a href="${part}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${part}</a>`;
        }
        return part;
    }).join('');

    return (
        <div 
            className={`message-bubble ${isOwn ? 'bg-purple-600' : 'bg-gray-700'} p-3 rounded-lg max-w-[80%] break-words`}
        >
            <div
                className="text-white text-sm"
                dangerouslySetInnerHTML={{ __html: linkifiedContent }}
            />
        </div>
    );
};

export default ChatMessage;
