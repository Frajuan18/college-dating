// components/Message.jsx
import React from 'react';
import { HiOutlineCheck, HiOutlineClock } from 'react-icons/hi';

const Message = ({ message, isOwn, isDark, otherUser }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      {!isOwn && (
        <div className="flex-shrink-0 mr-2 mt-1">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-rose-500 to-pink-500">
            {otherUser?.photo_url ? (
              <img 
                src={otherUser.photo_url} 
                alt="" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                {otherUser?.first_name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={`max-w-[85%] sm:max-w-[70%] ${!isOwn ? 'mr-2' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isOwn
              ? isDark
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white'
                : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
              : isDark
                ? 'bg-gray-700 text-gray-200'
                : 'bg-white text-gray-800 border border-gray-200'
          }`}
        >
          <p className="text-sm break-words leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {formatTime(message.created_at)}
          </span>
          {isOwn && message.status === 'read' && (
            <HiOutlineCheck className="w-3 h-3 text-green-500" />
          )}
          {isOwn && message.status === 'sent' && (
            <HiOutlineClock className="w-3 h-3 text-yellow-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;