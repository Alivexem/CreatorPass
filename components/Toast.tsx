import React, { useEffect } from 'react';
import { IoMdClose } from "react-icons/io";

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }[type];

  return (
    <div className={`fixed top-[20%] right-5 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-x-3 z-50`}>
      <p>{message}</p>
      <button onClick={onClose} className="hover:opacity-80">
        <IoMdClose size={20} />
      </button>
    </div>
  );
};

export default Toast; 