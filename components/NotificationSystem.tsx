import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, off, update } from 'firebase/database';
import { app } from '@/utils/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { IoNotifications } from 'react-icons/io5';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'gift' | 'message';
  data: any;
  timestamp: number;
  read: boolean;
}

export const NotificationSystem = ({ userAddress }: { userAddress: string }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!userAddress) return;

    const database = getDatabase(app);
    const notificationsRef = ref(database, `notifications/${userAddress}`);

    const handleNotifications = (snapshot: any) => {
      if (snapshot.exists()) {
        const notificationsData = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        
        setNotifications(notificationsData.sort((a, b) => b.timestamp - a.timestamp));
        setUnreadCount(notificationsData.filter(n => !n.read).length);
      }
    };

    onValue(notificationsRef, handleNotifications);

    return () => {
      off(notificationsRef, 'value', handleNotifications);
    };
  }, [userAddress]);

  const markAsRead = async (notificationId: string) => {
    const database = getDatabase(app);
    await update(ref(database, `notifications/${userAddress}/${notificationId}`), {
      read: true
    });
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
        router.push(`/creator/${notification.data.creatorAddress}`);
        break;
      case 'message':
        router.push(`/chat/${notification.data.senderAddress}`);
        break;
      case 'gift':
        router.push(`/dashboard`);
        break;
    }
    
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-white hover:bg-gray-700 rounded-full transition-colors"
      >
        <IoNotifications size={24} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-400 p-4 text-center">No notifications</p>
              ) : (
                notifications.map(notification => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                      !notification.read ? 'bg-gray-700/50' : ''
                    }`}
                  >
                    <p className="text-white text-sm">
                      {notification.type === 'like' && `${notification.data.username} liked your post`}
                      {notification.type === 'comment' && `${notification.data.username} commented: ${notification.data.text}`}
                      {notification.type === 'gift' && `${notification.data.username} sent you a gift of ${notification.data.amount} SOL`}
                      {notification.type === 'message' && `New message from ${notification.data.senderName}`}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 