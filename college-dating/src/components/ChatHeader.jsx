// components/ChatHeader.jsx
import React from 'react';
import { HiOutlineArrowLeft, HiOutlineAcademicCap, HiOutlineDotsVertical } from 'react-icons/hi';

const ChatHeader = ({ conversation, onBack, onViewProfile, isDark }) => {
  return (
    <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition md:hidden"
        >
          <HiOutlineArrowLeft className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
        </button>

        <div className="relative cursor-pointer" onClick={onViewProfile}>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg">
            {conversation?.otherUser?.photo_url ? (
              <img 
                src={conversation.otherUser.photo_url} 
                alt={conversation.otherUser.first_name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                {conversation?.otherUser?.first_name?.[0]?.toUpperCase() || 
                 conversation?.otherUser?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"></div>
        </div>
        
        <div>
          <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {conversation?.otherUser?.full_name || 
             `${conversation?.otherUser?.first_name || ''} ${conversation?.otherUser?.last_name || ''}`.trim()}
          </h3>
          <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <HiOutlineAcademicCap className="w-3 h-3" />
            {conversation?.otherUser?.university_name || 'University Student'}
          </p>
        </div>
      </div>
      
      <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
        <HiOutlineDotsVertical className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
      </button>
    </div>
  );
};

export default ChatHeader;