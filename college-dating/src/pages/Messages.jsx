// pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import { messageService } from '../services/messageService';
import Navbar from '../components/Navbar';
import { 
  HiOutlineChat,
  HiOutlineSearch,
  HiOutlinePaperAirplane,
  HiOutlineArrowLeft,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineAcademicCap,
  HiOutlineDotsVertical
} from 'react-icons/hi';

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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const autoScrollTimeoutRef = useRef(null);

  // Smooth scroll to bottom function
  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current && !isUserScrolling) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: behavior,
        block: 'end'
      });
    }
  };

  // Check if user is at bottom
  const isAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollHeight - scrollTop <= clientHeight + 100;
  };

  // Handle scroll events
  const handleScroll = () => {
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }
    
    if (!isAtBottom()) {
      setIsUserScrolling(true);
      autoScrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 3000);
    } else {
      setIsUserScrolling(false);
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (!isUserScrolling) {
      scrollToBottom('smooth');
    }
  }, [messages]);

  // Focus input on conversation select
  useEffect(() => {
    if (selectedConversation && messageInputRef.current) {
      setTimeout(() => {
        messageInputRef.current.focus();
        // Reset scroll position
        setIsUserScrolling(false);
        scrollToBottom('auto');
      }, 100);
    }
  }, [selectedConversation]);

  useEffect(() => {
    checkUserAndFetch();
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
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

  // Real-time subscription for new messages
  useEffect(() => {
    if (!currentUser?.id) return;

    const newSubscription = messageService.subscribeToMessages(currentUser.id, async (newMsg) => {
      // Refresh conversations list
      const convResult = await messageService.getConversations(currentUser.id);
      if (convResult.success) {
        setConversations(convResult.data);
      }
      
      // If this message is for the currently selected conversation
      if (selectedConversation && newMsg.sender_id === selectedConversation.otherUserId) {
        setMessages(prev => [...prev, newMsg]);
        
        // Mark as read
        await messageService.markAsRead(newMsg.id);
      }
    });
    
    setSubscription(newSubscription);
    
    return () => {
      newSubscription.unsubscribe();
    };
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
      
      // Mark unread messages as read
      const unreadMessages = result.data.filter(
        msg => msg.receiver_id === currentUser.id && msg.status === 'sent'
      );
      
      for (const msg of unreadMessages) {
        await messageService.markAsRead(msg.id);
      }
      
      // Update conversations list to clear unread count
      setConversations(prev => prev.map(c => 
        c.otherUserId === conversation.otherUserId 
          ? { ...c, unreadCount: 0 } 
          : c
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
        
        // Reset textarea height
        if (messageInputRef.current) {
          messageInputRef.current.style.height = 'auto';
        }

        // Update conversations list
        const convResult = await messageService.getConversations(currentUser.id);
        if (convResult.success) {
          setConversations(convResult.data);
        }
      } else {
        alert(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
    setIsUserScrolling(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getCardStyles = () => {
    return isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-100';
  };

  const getTextStyles = () => {
    return isDark ? 'text-white' : 'text-gray-900';
  };

  const getSubtextStyles = () => {
    return isDark ? 'text-gray-400' : 'text-gray-500';
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
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-200 border-t-rose-500 mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-rose-500 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
            <p className={`text-sm ${getSubtextStyles()} mt-4`}>Loading your messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-rose-50 via-white to-pink-50'}`}>
      <Navbar />
      
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
            Messages
          </h1>
          <p className={`text-sm ${getSubtextStyles()} mt-1`}>
            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
          </p>
        </div>

        <div className={`rounded-2xl overflow-hidden shadow-2xl border ${getCardStyles()} backdrop-blur-sm`}>
          <div className="flex flex-col md:flex-row h-[calc(100vh-180px)] min-h-[500px] max-h-[800px]">
            {/* Conversations Sidebar - No scroll effect, just natural scroll */}
            <div className={`w-full md:w-80 lg:w-96 border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} ${selectedConversation ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
              {/* Search Header */}
              <div className="p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}">
                <div className="relative">
                  <HiOutlineSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getSubtextStyles()}`} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                      isDark
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-rose-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-rose-500'
                    }`}
                  />
                </div>
              </div>

              {/* Conversations List - Natural scrolling */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {filteredConversations.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center h-full p-8 text-center ${getSubtextStyles()}`}>
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
                            <h3 className={`font-semibold truncate ${getTextStyles()}`}>
                              {conv.otherUser?.full_name || 
                               `${conv.otherUser?.first_name || ''} ${conv.otherUser?.last_name || ''}`.trim() || 
                               'User'}
                            </h3>
                            {conv.lastMessage && (
                              <span className={`text-xs ml-2 flex-shrink-0 ${getSubtextStyles()}`}>
                                {formatTime(conv.lastMessage.created_at)}
                              </span>
                            )}
                          </div>
                          
                          {conv.otherUser?.university_name && (
                            <p className={`text-xs mb-1 flex items-center gap-1 ${getSubtextStyles()}`}>
                              <HiOutlineAcademicCap className="w-3 h-3" />
                              <span className="truncate">{conv.otherUser.university_name}</span>
                            </p>
                          )}
                          
                          {conv.lastMessage && (
                            <p className={`text-sm truncate ${
                              conv.unreadCount > 0 
                                ? isDark ? 'text-white font-medium' : 'text-gray-900 font-medium'
                                : getSubtextStyles()
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

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} backdrop-blur-sm flex-shrink-0`}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleBack}
                        className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                      >
                        <HiOutlineArrowLeft className={`w-5 h-5 ${getTextStyles()}`} />
                      </button>

                      <div className="relative cursor-pointer" onClick={() => setShowProfileModal(true)}>
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg">
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
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"></div>
                      </div>
                      
                      <div>
                        <h3 className={`font-semibold text-lg ${getTextStyles()}`}>
                          {selectedConversation.otherUser?.full_name || 
                           `${selectedConversation.otherUser?.first_name || ''} ${selectedConversation.otherUser?.last_name || ''}`.trim()}
                        </h3>
                        <p className={`text-xs flex items-center gap-1 ${getSubtextStyles()}`}>
                          <HiOutlineAcademicCap className="w-3 h-3" />
                          {selectedConversation.otherUser?.university_name || 'University Student'}
                        </p>
                      </div>
                    </div>
                    
                    <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                      <HiOutlineDotsVertical className={`w-5 h-5 ${getSubtextStyles()}`} />
                    </button>
                  </div>

                  {/* Messages Container - Smooth scrolling, no scrollbar effect */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    onScroll={handleScroll}
                    style={{
                      scrollBehavior: 'smooth',
                      overflowY: 'auto',
                      overflowX: 'hidden'
                    }}
                  >
                    {messages.length === 0 ? (
                      <div className={`flex flex-col items-center justify-center h-full text-center ${getSubtextStyles()}`}>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mb-4">
                          <HiOutlineChat className="w-12 h-12 text-rose-500" />
                        </div>
                        <p className="text-lg font-medium mb-2">No messages yet</p>
                        <p className="text-sm max-w-xs">Send a message to start the conversation!</p>
                      </div>
                    ) : (
                      <>
                        {/* Date Divider */}
                        {messages.length > 0 && (
                          <div className="flex justify-center my-4">
                            <span className={`px-3 py-1 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                              {new Date(messages[0].created_at).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                        )}
                        
                        {messages.map((msg, idx) => {
                          const isOwn = msg.sender_id === currentUser?.id;
                          const showDateDivider = idx > 0 && 
                            new Date(msg.created_at).toDateString() !== new Date(messages[idx - 1].created_at).toDateString();
                          
                          return (
                            <React.Fragment key={msg.id}>
                              {showDateDivider && (
                                <div className="flex justify-center my-4">
                                  <span className={`px-3 py-1 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                    {new Date(msg.created_at).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                                  </span>
                                </div>
                              )}
                              
                              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                {!isOwn && (
                                  <div className="flex-shrink-0 mr-2 mt-1">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-rose-500 to-pink-500">
                                      {selectedConversation.otherUser?.photo_url ? (
                                        <img 
                                          src={selectedConversation.otherUser.photo_url} 
                                          alt="" 
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                                          {selectedConversation.otherUser?.first_name?.[0]?.toUpperCase() || 'U'}
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
                                    <p className="text-sm break-words leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                  </div>
                                  <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                    <span className={`text-xs ${getSubtextStyles()}`}>
                                      {formatMessageTime(msg.created_at)}
                                    </span>
                                    {isOwn && msg.status === 'read' && (
                                      <HiOutlineCheck className="w-3 h-3 text-green-500" />
                                    )}
                                    {isOwn && msg.status === 'sent' && (
                                      <HiOutlineClock className="w-3 h-3 text-yellow-500" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input - No scroll, fixed height */}
                  <div className={`p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} backdrop-blur-sm flex-shrink-0`}>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 relative">
                        <textarea
                          ref={messageInputRef}
                          value={newMessage}
                          onChange={(e) => {
                            setNewMessage(e.target.value);
                            // Auto-resize without scroll
                            e.target.style.height = 'auto';
                            const newHeight = Math.min(e.target.scrollHeight, 100);
                            e.target.style.height = newHeight + 'px';
                          }}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          rows="1"
                          className={`w-full px-4 py-3 rounded-xl border resize-none transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                            isDark
                              ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-rose-500'
                              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-rose-500'
                          }`}
                          style={{
                            minHeight: '44px',
                            maxHeight: '100px',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin'
                          }}
                        />
                      </div>
                      
                      <button
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                        className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                          sending || !newMessage.trim()
                            ? isDark
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : isDark
                              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:shadow-lg hover:scale-105'
                              : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-lg hover:scale-105'
                        }`}
                      >
                        {sending ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <HiOutlinePaperAirplane className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mx-auto mb-6">
                      <HiOutlineChat className="w-16 h-16 text-rose-500" />
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${getTextStyles()}`}>
                      Welcome to Messages
                    </h3>
                    <p className={`text-sm max-w-sm ${getSubtextStyles()}`}>
                      Select a conversation from the sidebar to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowProfileModal(false)}>
          <div className={`max-w-md w-full rounded-2xl overflow-hidden shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} animate-scaleIn`} onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <div className="h-48 bg-gradient-to-r from-rose-500 to-pink-500"></div>
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-gradient-to-br from-rose-500 to-pink-500">
                  {selectedConversation.otherUser?.photo_url ? (
                    <img 
                      src={selectedConversation.otherUser.photo_url} 
                      alt={selectedConversation.otherUser.first_name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                      {selectedConversation.otherUser?.first_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-20 pb-6 px-6 text-center">
              <h2 className={`text-2xl font-bold mb-1 ${getTextStyles()}`}>
                {selectedConversation.otherUser?.full_name || 
                 `${selectedConversation.otherUser?.first_name || ''} ${selectedConversation.otherUser?.last_name || ''}`.trim()}
              </h2>
              {selectedConversation.otherUser?.university_name && (
                <p className={`text-sm flex items-center justify-center gap-1 ${getSubtextStyles()}`}>
                  <HiOutlineAcademicCap className="w-4 h-4" />
                  {selectedConversation.otherUser.university_name}
                </p>
              )}
              {selectedConversation.otherUser?.department && (
                <p className={`text-xs mt-1 ${getSubtextStyles()}`}>
                  {selectedConversation.otherUser.department}
                </p>
              )}
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    navigate(`/profile/${selectedConversation.otherUserId}`);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium hover:shadow-lg transition"
                >
                  View Profile
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className={`flex-1 px-4 py-2 rounded-xl border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add animation styles
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-scaleIn {
  animation: scaleIn 0.2s ease-out;
}

/* Custom scrollbar styling - minimal and clean */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}

/* Hide scrollbar when not hovering */
.overflow-y-auto {
  scrollbar-width: thin;
}

/* Smooth transitions */
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Messages;