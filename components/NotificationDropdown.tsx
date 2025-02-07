'use client'
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoNotificationsOutline, IoNotifications } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RxDotFilled } from "react-icons/rx";
import { getDatabase, ref, onValue, remove, query, orderByChild } from 'firebase/database';
import { app } from '@/utils/firebase';

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
    const database = getDatabase(app);

    useEffect(() => {
        const address = localStorage.getItem('address');
        if (!address) return;

        const notificationsRef = ref(database, `notifications/${address}`);
        const notificationsQuery = query(notificationsRef, orderByChild('timestamp'));

        const unsubscribe = onValue(notificationsQuery, (snapshot) => {
            const notificationsData = snapshot.val();
            if (notificationsData) {
                const notificationsList = Object.entries(notificationsData).map(([id, data]: [string, any]) => ({
                    _id: id,
                    ...data,
                }));
                setNotifications(notificationsList);
                setUnreadCount(notificationsList.filter(n => !n.read).length);
            } else {
                setNotifications([]);
                setUnreadCount(0);
            }
        });

        return () => unsubscribe();
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
            const address = localStorage.getItem('address');
            if (!address) return;

            const notificationRef = ref(database, `notifications/${address}/${id}`);
            await remove(notificationRef);
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
                        <IoNotifications className="text-[18px] md:text-[25px]" />
                        <RxDotFilled className="absolute -top-1 -right-1 text-blue-500 text-lg" />
                    </>
                ) : (
                    <IoNotificationsOutline className="text-[18px] md:text-[25px]" />
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
