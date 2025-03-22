'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';

interface User {
  address: string;
  joinDate: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isAuthorized) {
      fetch('/api/users/auth')
        .then(res => res.json())
        .then(data => setUsers(data.users));
    }
  }, [isAuthorized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await res.json();
      if (data.success) {
        setIsAuthorized(true);
      } else {
        console.error('Authentication failed:', data.error);
      }
    } catch (error) {
      console.error('Authentication request failed:', error);
    }
  };

  const filterUsers = (users: User[]) => {
    const now = dayjs();
    switch (filter) {
      case 'today':
        return users.filter(user => dayjs(user.joinDate).isSame(now, 'day'));
      case 'yesterday':
        return users.filter(user => dayjs(user.joinDate).isSame(now.subtract(1, 'day'), 'day'));
      case 'week':
        return users.filter(user => dayjs(user.joinDate).isAfter(now.subtract(7, 'day')));
      case 'month':
        return users.filter(user => dayjs(user.joinDate).isAfter(now.subtract(1, 'month')));
      default:
        return users;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <AnimatePresence>
        {!isAuthorized ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter admin password"
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Login
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center text-4xl mb-8"
            >
              ✅ Authorized
            </motion.div>
            
            <div className="flex gap-4 mb-6">
              {['all', 'today', 'yesterday', 'week', 'month'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded ${
                    filter === f ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <motion.div layout className="grid gap-4">
              {filterUsers(users).map((user, index) => (
                <motion.div
                  key={user.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-4 rounded-lg shadow"
                >
                  <p className="font-mono">{user.address}</p>
                  <p className="text-gray-500">
                    {dayjs(user.joinDate).format('YYYY-MM-DD HH:mm:ss')}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
