// components/ConversationList.jsx
import React from 'react';
import { HiOutlineSearch, HiOutlineChat, HiOutlineAcademicCap } from 'react-icons/hi';

const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  currentUser,
  isDark,
  searchQuery,
  onSearchChange
}) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <HiOutlineSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 ${
              isDark
                ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-full p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mb-4">
              <HiOutlineChat className="w-10 h-10 text-rose-500" />
            </div>
            <p className="text-lg font-medium mb-2">No conversations yet</p>
            <p className="text-sm">Go to matches and start chatting!</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.otherUserId}
              onClick={() => onSelectConversation(conv)}
              className={`p-4 cursor-pointer transition-all duration-200 ${
                selectedConversation?.otherUserId === conv.otherUserId
                  ? isDark 
                    ? 'bg-gray-700/50 border-l-4 border-rose-500' 
                    : 'bg-rose-50 border-l-4 border-rose-500'
                  : isDark 
                    ? 'hover:bg-gray-700/30 border-l-4 border-transparent' 
                    : 'hover:bg-rose-50/50 border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg">
                    {conv.otherUser?.photo_url ? (
                      <img 
                        src={conv.otherUser.photo_url} 
                        alt={conv.otherUser.first_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white">
                        {conv.otherUser?.first_name?.[0]?.toUpperCase() || 
                         conv.otherUser?.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {conv.otherUser?.full_name || 
                       `${conv.otherUser?.first_name || ''} ${conv.otherUser?.last_name || ''}`.trim() || 
                       'User'}
                    </h3>
                    {conv.lastMessage && (
                      <span className={`text-xs ml-2 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatTime(conv.lastMessage.created_at)}
                      </span>
                    )}
                  </div>
                  
                  {conv.otherUser?.university_name && (
                    <p className={`text-xs mb-1 flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <HiOutlineAcademicCap className="w-3 h-3" />
                      <span className="truncate">{conv.otherUser.university_name}</span>
                    </p>
                  )}
                  
                  {conv.lastMessage && (
                    <p className={`text-sm truncate ${
                      conv.unreadCount > 0 
                        ? isDark ? 'text-white font-medium' : 'text-gray-900 font-medium'
                        : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {conv.lastMessage.sender_id === currentUser?.id ? (
                        <span className="text-rose-500">You: </span>
                      ) : ''}
                      {conv.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;