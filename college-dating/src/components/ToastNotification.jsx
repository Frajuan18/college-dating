// components/ToastNotification.jsx
import React, { useEffect } from 'react';
import { HiOutlineX, HiOutlineChat } from 'react-icons/hi';

const ToastNotification = ({ message, onClose, onClick }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div 
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-l-4 border-rose-500 cursor-pointer hover:shadow-xl transition-all transform animate-slide-in"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {message.sender?.photo_url ? (
              <img 
                src={message.sender.photo_url} 
                alt={message.sender.full_name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-500"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <HiOutlineChat className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {message.sender?.full_name || 'New Message'}
              </p>
              <span className="text-xs text-gray-400">
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {message.content}
            </p>
            {message.sender?.university_name && (
              <p className="text-xs text-gray-400 mt-1">
                {message.sender.university_name}
              </p>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <HiOutlineX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;