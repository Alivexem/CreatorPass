import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaImage, FaVideo, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import Toast from './Toast';

interface MediaUploaderProps {
  onFileSelect: (file: File) => void;
  onClear: () => void;
  selectedFile: File | null;
  previewUrl: string | null;
  type: 'image' | 'video' | null;
  maxSize?: number; // in MB
}

export const MediaUploader = ({
  onFileSelect,
  onClear,
  selectedFile,
  previewUrl,
  type,
  maxSize = 10 // Default max size is 10MB
}: MediaUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'info'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      setToast({
        show: true,
        message: `File size must be less than ${maxSize}MB`,
        type: 'error'
      });
      return false;
    }

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setToast({
        show: true,
        message: 'Only image and video files are allowed',
        type: 'error'
      });
      return false;
    }

    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {!selectedFile ? (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          animate={{ scale: isDragging ? 1.02 : 1 }}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
            isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-500'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              <FaImage className="text-2xl text-gray-400" />
              <FaVideo className="text-2xl text-gray-400" />
            </div>
            <p className="text-gray-400">
              Drag and drop or click to upload image/video
            </p>
            <p className="text-gray-500 text-sm">
              Max size: {maxSize}MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>
      ) : (
        <div className="relative">
          {type === 'image' ? (
            <Image
              src={previewUrl!}
              alt="Preview"
              width={300}
              height={200}
              className="rounded-lg object-cover"
            />
          ) : (
            <video
              src={previewUrl!}
              controls
              className="w-full rounded-lg"
            />
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={onClear}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          >
            <FaTimes />
          </motion.button>
        </div>
      )}
    </div>
  );
}; 