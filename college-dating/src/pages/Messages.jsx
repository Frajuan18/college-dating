// pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import { messageService } from '../services/messageService';
import Navbar from '../components/Navbar';
import { HiOutlineChat } from 'react-icons/hi';

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [subscription, setSubscription] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkUserAndFetch();
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Handle navigation from matches page
  useEffect(() => {
    if (location.state?.userId && conversations.length > 0 && currentUser) {
      const conversation = conversations.find(c => c.otherUserId === location.state.userId);
      if (conversation) {
        handleSelectConversation(conversation);
      }
    }
  }, [location.state, conversations, currentUser]);

  // Real-time subscription
  useEffect(() => {
    if (!currentUser?.id) return;

    const newSubscription = messageService.subscribeToMessages(currentUser.id, async (newMsg) => {
      const convResult = await messageService.getConversations(currentUser.id);
      if (convResult.success) {
        setConversations(convResult.data);
      }
      
      if (selectedConversation && newMsg.sender_id === selectedConversation.otherUserId) {
        setMessages(prev => [...prev, newMsg]);
        await messageService.markAsRead(newMsg.id);
      }
    });
    
    setSubscription(newSubscription);
    return () => newSubscription.unsubscribe();
  }, [currentUser?.id, selectedConversation]);

  const checkUserAndFetch = async () => {
    try {
      const telegramId = localStorage.getItem('telegramId');
      if (!telegramId) {
        navigate('/login');
        return;
      }
      await fetchCurrentUser();
    } catch (error) {
      console.error('Error:', error);
      navigate('/login');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const telegramId = localStorage.getItem('telegramId');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', parseInt(telegramId))
        .single();

      if (userError) throw userError;
      setCurrentUser(userData);
      await fetchConversations(userData.id);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('telegramId');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async (userId) => {
    try {
      const result = await messageService.getConversations(userId);
      if (result.success) {
        setConversations(result.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    const result = await messageService.getMessages(currentUser.id, conversation.otherUserId);
    if (result.success) {
      setMessages(result.data);
      
      const unreadMessages = result.data.filter(
        msg => msg.receiver_id === currentUser.id && msg.status === 'sent'
      );
      
      for (const msg of unreadMessages) {
        await messageService.markAsRead(msg.id);
      }
      
      setConversations(prev => prev.map(c => 
        c.otherUserId === conversation.otherUserId ? { ...c, unreadCount: 0 } : c
      ));
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const result = await messageService.sendMessage(
        currentUser.id,
        selectedConversation.otherUserId,
        newMessage.trim()
      );

      if (result.success) {
        setMessages(prev => [...prev, result.data]);
        setNewMessage('');
        
        const convResult = await messageService.getConversations(currentUser.id);
        if (convResult.success) {
          setConversations(convResult.data);
        }
        
        setTimeout(scrollToBottom, 100);
      } else {
        alert(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

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

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getDateGroup = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv => 
    conv.otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser?.first_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-rose-50 to-pink-50'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-200 border-t-rose-500 mx-auto mb-4"></div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-rose-50 to-pink-50'}`}>
      <Navbar />
      
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className={`text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent`}>
          Messages
        </h1>

        <div className={`rounded-2xl overflow-hidden shadow-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-100'} backdrop-blur-sm`}>
          <div className="flex flex-col md:flex-row h-[70vh] min-h-[500px]">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} ${selectedConversation ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                      isDark
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center h-full p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mb-4">
                      <HiOutlineChat className="w-10 h-10 text-rose-500" />
                    </div>
                    <p className="text-lg font-medium mb-2">No conversations yet</p>
                    <p className="text-sm">Go to matches and start chatting!</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.otherUserId}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-4 cursor-pointer transition ${
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
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-rose-500 to-pink-500">
                            {conv.otherUser?.photo_url ? (
                              <img 
                                src={conv.otherUser.photo_url} 
                                alt={conv.otherUser.first_name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                                {conv.otherUser?.first_name?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {conv.otherUser?.full_name || 
                               `${conv.otherUser?.first_name || ''} ${conv.otherUser?.last_name || ''}`.trim() || 'User'}
                            </h3>
                            {conv.lastMessage && (
                              <span className={`text-xs ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatTime(conv.lastMessage.created_at)}
                              </span>
                            )}
                          </div>
                          
                          {conv.lastMessage && (
                            <p className={`text-sm truncate ${
                              conv.unreadCount > 0 
                                ? isDark ? 'text-white font-medium' : 'text-gray-900 font-medium'
                                : isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {conv.lastMessage.sender_id === currentUser?.id ? 'You: ' : ''}
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

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className={`p-4 border-b flex items-center gap-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={handleBack}
                      className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                      <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-rose-500 to-pink-500">
                      {selectedConversation.otherUser?.photo_url ? (
                        <img 
                          src={selectedConversation.otherUser.photo_url} 
                          alt={selectedConversation.otherUser.first_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                          {selectedConversation.otherUser?.first_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedConversation.otherUser?.full_name || 
                         `${selectedConversation.otherUser?.first_name || ''} ${selectedConversation.otherUser?.last_name || ''}`.trim()}
                      </h3>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                  >
                    {messages.length === 0 ? (
                      <div className={`flex flex-col items-center justify-center h-full text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <HiOutlineChat className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No messages yet</p>
                        <p className="text-sm">Send a message to start the conversation!</p>
                      </div>
                    ) : (
                      <>
                        {(() => {
                          let lastDate = null;
                          return messages.map((msg) => {
                            const msgDate = getDateGroup(msg.created_at);
                            const showDateDivider = lastDate !== msgDate;
                            lastDate = msgDate;
                            const isOwn = msg.sender_id === currentUser?.id;
                            
                            return (
                              <React.Fragment key={msg.id}>
                                {showDateDivider && (
                                  <div className="flex justify-center my-4">
                                    <span className={`px-3 py-1 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                      {msgDate}
                                    </span>
                                  </div>
                                )}
                                
                                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                    isOwn
                                      ? isDark
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-rose-500 text-white'
                                      : isDark
                                        ? 'bg-gray-700 text-gray-200'
                                        : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    <p className="text-sm break-words">{msg.content}</p>
                                    <div className={`flex justify-end mt-1`}>
                                      <span className={`text-xs ${
                                        isOwn 
                                          ? 'text-rose-100' 
                                          : isDark ? 'text-gray-400' : 'text-gray-500'
                                      }`}>
                                        {formatMessageTime(msg.created_at)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          });
                        })()}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex gap-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        rows="1"
                        className={`flex-1 px-4 py-3 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        }`}
                        style={{ minHeight: '44px', maxHeight: '100px' }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                        className={`p-3 rounded-xl transition ${
                          sending || !newMessage.trim()
                            ? isDark
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : isDark
                              ? 'bg-rose-600 text-white hover:bg-rose-700'
                              : 'bg-rose-500 text-white hover:bg-rose-600'
                        }`}
                      >
                        {sending ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Press Enter to send • Shift + Enter for new line
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-8">
                    <HiOutlineChat className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                    <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Select a conversation
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Choose a chat from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;