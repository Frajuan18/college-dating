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
      className="fixed bottom-6 right-6 z-50 max-w-sm cursor-pointer transform transition-all duration-300 hover:scale-105 animate-slide-in"
    >
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 opacity-95"></div>
        
        {/* Content */}
        <div className="relative p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 ring-2 ring-white/50">
                {message.sender?.photo_url ? (
                  <img 
                    src={message.sender.photo_url} 
                    alt={message.sender.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HiOutlineChat className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-white">
                  {message.sender?.full_name || 'New Message'}
                </p>
                <span className="text-xs text-white/70">
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-white/90 line-clamp-2">
                {message.content}
              </p>
              {message.sender?.university_name && (
                <p className="text-xs text-white/70 mt-1">
                  {message.sender.university_name}
                </p>
              )}
            </div>
            
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex-shrink-0 text-white/70 hover:text-white transition"
            >
              <HiOutlineX className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div className="h-full bg-white/50 animate-progress-shrink"></div>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;