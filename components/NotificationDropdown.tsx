'use client'
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoNotificationsOutline, IoNotifications } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RxDotFilled } from "react-icons/rx";

interface Notification {
    _id: string;
    senderAddress: string;
    senderName: string;
    senderImage: string;
    message: string;
    createdAt: string;
    read: boolean;
}

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchNotifications = async () => {
            const address = localStorage.getItem('address');
            if (!address) return;

            const res = await fetch(`/api/notifications?address=${address}`);
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        router.push(`/creators?highlight=${notification.senderAddress}`);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white hover:text-purple-500 transition-colors flex items-center"
            >
                {unreadCount > 0 ? (
                    <>
                        <IoNotifications size={24} />
                        <RxDotFilled className="absolute -top-1 -right-1 text-blue-500 text-lg" />
                    </>
                ) : (
                    <IoNotificationsOutline size={24} />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 md:right-auto mt-2 w-80 bg-[#1A1D1F] rounded-lg shadow-lg overflow-hidden z-50"
                    >
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <p className="p-4 text-gray-400 text-center">No notifications</p>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className="p-4 border-b border-gray-700 hover:bg-gray-800 transition-colors flex items-start justify-between gap-3"
                                    >
                                        <div
                                            className="flex items-start gap-3 cursor-pointer flex-1"
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <Image
                                                src={notification.senderImage || '/empProfile.png'}
                                                alt=""
                                                width={40}
                                                height={40}
                                                className="rounded-full"
                                            />
                                            <div>
                                                <p className="text-white font-semibold">{notification.senderName}</p>
                                                <p className="text-gray-400 text-sm">{notification.message}</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(notification._id)}
                                            className="text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            <MdDelete size={20} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 