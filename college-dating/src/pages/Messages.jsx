// pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import { messageService } from '../services/messageService';
import Navbar from '../components/Navbar';
import { 
  HiOutlineChat,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineSearch,
  HiOutlinePaperAirplane,
  HiOutlineArrowLeft
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
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkUserAndFetch();
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
      } else {
        console.error('Error fetching conversations:', result.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    // Fetch messages between current user and selected user
    const result = await messageService.getMessages(
      currentUser.id,
      conversation.otherUserId
    );

    if (result.success) {
      setMessages(result.data);
      
      // Mark unread messages as read
      if (conversation.unreadCount > 0) {
        const unreadMessages = result.data.filter(
          msg => msg.receiver_id === currentUser.id && !msg.read
        );
        
        for (const msg of unreadMessages) {
          await messageService.markAsRead(msg.id);
        }
        
        // Update conversations list
        setConversations(prev => prev.map(c => 
          c.otherUserId === conversation.otherUserId 
            ? { ...c, unreadCount: 0 } 
            : c
        ));
      }
    }

    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);

    try {
      const result = await messageService.sendMessage(
        currentUser.id,
        selectedConversation.otherUserId,
        newMessage.trim()
      );

      if (result.success) {
        // Add message to local state
        setMessages(prev => [...prev, result.data]);
        setNewMessage('');

        // Update conversations list
        setConversations(prev => {
          const updated = prev.map(c => 
            c.otherUserId === selectedConversation.otherUserId 
              ? { 
                  ...c, 
                  lastMessage: result.data,
                  messages: [...c.messages, result.data]
                }
              : c
          );
          return updated.sort((a, b) => 
            new Date(b.lastMessage?.created_at || 0) - new Date(a.lastMessage?.created_at || 0)
          );
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCardStyles = () => {
    return isDark
      ? 'bg-gray-800 border-gray-700'
      : 'bg-white border-gray-100';
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
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-rose-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className={`text-3xl sm:text-4xl font-bold mb-6 ${getTextStyles()}`}>
          Messages
        </h1>

        <div className={`rounded-xl overflow-hidden border ${getCardStyles()}`}>
          <div className="flex flex-col md:flex-row h-[600px]">
            {/* Conversations List */}
            <div className={`w-full md:w-80 border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} ${selectedConversation ? 'hidden md:block' : 'block'}`}>
              <div className="p-4">
                <div className="relative">
                  <HiOutlineSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>

              <div className="overflow-y-auto h-[calc(600px-73px)]">
                {filteredConversations.length === 0 ? (
                  <div className={`text-center py-8 ${getSubtextStyles()}`}>
                    <HiOutlineChat className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.otherUserId}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-4 cursor-pointer transition ${
                        selectedConversation?.otherUserId === conv.otherUserId
                          ? isDark ? 'bg-gray-700' : 'bg-rose-50'
                          : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                            {conv.otherUser?.photo_url ? (
                              <img 
                                src={conv.otherUser.photo_url} 
                                alt={conv.otherUser.first_name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-600">
                                {conv.otherUser?.first_name?.[0] || 'U'}
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
                            <h3 className={`font-semibold truncate ${getTextStyles()}`}>
                              {conv.otherUser?.full_name || 
                               `${conv.otherUser?.first_name || ''} ${conv.otherUser?.last_name || ''}`.trim() || 
                               'User'}
                            </h3>
                            {conv.lastMessage && (
                              <span className={`text-xs ml-2 ${getSubtextStyles()}`}>
                                {formatTime(conv.lastMessage.created_at)}
                              </span>
                            )}
                          </div>
                          
                          {conv.otherUser?.university_name && (
                            <p className={`text-xs mb-1 ${getSubtextStyles()}`}>
                              {conv.otherUser.university_name}
                            </p>
                          )}
                          
                          {conv.lastMessage && (
                            <p className={`text-sm truncate ${
                              conv.unreadCount > 0 
                                ? isDark ? 'text-white font-medium' : 'text-gray-900 font-medium'
                                : getSubtextStyles()
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
                      <HiOutlineArrowLeft className={`w-5 h-5 ${getTextStyles()}`} />
                    </button>

                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                      {selectedConversation.otherUser?.photo_url ? (
                        <img 
                          src={selectedConversation.otherUser.photo_url} 
                          alt={selectedConversation.otherUser.first_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-600">
                          {selectedConversation.otherUser?.first_name?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${getTextStyles()}`}>
                        {selectedConversation.otherUser?.full_name || 
                         `${selectedConversation.otherUser?.first_name || ''} ${selectedConversation.otherUser?.last_name || ''}`.trim()}
                      </h3>
                      <p className={`text-xs ${getSubtextStyles()}`}>
                        {selectedConversation.otherUser?.university_name || 'University Student'}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className={`text-center py-8 ${getSubtextStyles()}`}>
                        <p>No messages yet</p>
                        <p className="text-sm mt-2">Send a message to start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isOwn = msg.sender_id === currentUser?.id;
                        
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                isOwn
                                  ? isDark
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-rose-500 text-white'
                                  : isDark
                                    ? 'bg-gray-700 text-gray-200'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p className="text-sm break-words">{msg.content}</p>
                              <div className="flex justify-end mt-1">
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
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex gap-2">
                      <input
                        ref={messageInputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className={`flex-1 px-4 py-3 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                        className={`p-3 rounded-lg transition ${
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
                          <HiOutlinePaperAirplane className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <HiOutlineChat className={`w-16 h-16 mx-auto mb-4 ${getSubtextStyles()}`} />
                    <h3 className={`text-lg font-medium mb-2 ${getTextStyles()}`}>
                      Select a conversation
                    </h3>
                    <p className={`text-sm ${getSubtextStyles()}`}>
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