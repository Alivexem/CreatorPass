'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import toast, { Toaster } from 'react-hot-toast';

interface User {
  address: string;
  joinDate: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Authentication successful');
        setIsAuthorized(true);
      } else {
        toast.error(data.error || 'Authentication failed');
      }
    } catch (error) {
      toast.error('Authentication request failed');
      console.error('Authentication request failed:', error);
    } finally {
      setIsLoading(false);
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
      <Toaster position="top-right" />
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
                disabled={isLoading}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className='text-black'>Loading...</p>
                  </>
                ) : 'Login'}
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
              className="text-center text-black text-4xl mb-8"
            >
              ✅ Authorized
            </motion.div>
            
            <div className="gap-4 mb-6 grid grid-cols-3 md:grid-cols-5">
              {['all', 'today', 'yesterday', 'week', 'month'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded ${
                    filter === f ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-black">Total Users: </span>
                  <span className="font-bold text-black">{users.length}</span>
                </div>
                <div>
                  <span className="text-black">Filtered Users: </span>
                  <span className="font-bold text-black">{filterUsers(users).length}</span>
                </div>
              </div>
            </div>

            <motion.div layout className="grid mb-[120px] h-[40vh] w-full overflow-y-auto gap-4">
              {filterUsers(users).map((user, index) => (
                <motion.div
                  key={user.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white w-full md:w-[600px] p-4 rounded-lg shadow"
                >
                  <p className="font-mono text-[0.6rem] md:text-[1rem] text-black">{user.address}</p>
                  <p className="text-gray-800">
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
