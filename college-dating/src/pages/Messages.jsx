// pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import { messageService } from '../services/messageService';
import Navbar from '../components/Navbar';
import ConversationList from '../components/ConversationList';
import ChatHeader from '../components/ChatHeader';
import Message from '../components/Message';
import MessageInput from '../components/MessageInput';

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current && !isUserScrolling) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  // Check if at bottom
  const checkIfAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollHeight - scrollTop <= clientHeight + 50;
  };

  // Handle scroll
  const handleScroll = () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    
    const atBottom = checkIfAtBottom();
    if (!atBottom) {
      setIsUserScrolling(true);
      scrollTimeoutRef.current = setTimeout(() => setIsUserScrolling(false), 2000);
    } else {
      setIsUserScrolling(false);
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (!isUserScrolling && messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages]);

  // Focus input on conversation select
  useEffect(() => {
    if (selectedConversation) {
      setIsUserScrolling(false);
      setTimeout(() => scrollToBottom('auto'), 100);
    }
  }, [selectedConversation]);

  // Initial load
  useEffect(() => {
    checkUserAndFetch();
    return () => {
      if (subscription) subscription.unsubscribe();
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Handle navigation from matches
  useEffect(() => {
    if (location.state?.userId && conversations.length > 0 && currentUser) {
      const conversation = conversations.find(c => c.otherUserId === location.state.userId);
      if (conversation) handleSelectConversation(conversation);
    }
  }, [location.state, conversations, currentUser]);

  // Real-time subscription
  useEffect(() => {
    if (!currentUser?.id) return;

    const newSubscription = messageService.subscribeToMessages(currentUser.id, async (newMsg) => {
      const convResult = await messageService.getConversations(currentUser.id);
      if (convResult.success) setConversations(convResult.data);
      
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
      console.error('Error:', error);
      localStorage.removeItem('telegramId');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async (userId) => {
    try {
      const result = await messageService.getConversations(userId);
      if (result.success) setConversations(result.data);
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

  const handleSendMessage = async (content) => {
    if (!content || !selectedConversation) return;

    try {
      const result = await messageService.sendMessage(
        currentUser.id,
        selectedConversation.otherUserId,
        content
      );

      if (result.success) {
        setMessages(prev => [...prev, result.data]);
        
        const convResult = await messageService.getConversations(currentUser.id);
        if (convResult.success) setConversations(convResult.data);
        
        setTimeout(() => scrollToBottom('smooth'), 100);
      } else {
        alert(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message');
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  const handleViewProfile = () => {
    setShowProfileModal(true);
  };

  // Format date for grouping messages
  const getDateGroup = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

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
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-4`}>Loading your messages...</p>
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
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
          </p>
        </div>

        <div className={`rounded-2xl overflow-hidden shadow-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-100'} backdrop-blur-sm`}>
          <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] min-h-[500px]">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                currentUser={currentUser}
                isDark={isDark}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
              {selectedConversation ? (
                <>
                  <ChatHeader
                    conversation={selectedConversation}
                    onBack={handleBack}
                    onViewProfile={handleViewProfile}
                    isDark={isDark}
                  />

                  {/* Messages Container */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    onScroll={handleScroll}
                  >
                    {messages.length === 0 ? (
                      <div className={`flex flex-col items-center justify-center h-full text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mb-4">
                          <HiOutlineChat className="w-12 h-12 text-rose-500" />
                        </div>
                        <p className="text-lg font-medium mb-2">No messages yet</p>
                        <p className="text-sm max-w-xs">Send a message to start the conversation!</p>
                      </div>
                    ) : (
                      <>
                        {(() => {
                          let lastDate = null;
                          return messages.map((msg) => {
                            const msgDate = getDateGroup(msg.created_at);
                            const showDateDivider = lastDate !== msgDate;
                            lastDate = msgDate;
                            
                            return (
                              <React.Fragment key={msg.id}>
                                {showDateDivider && (
                                  <div className="flex justify-center my-4">
                                    <span className={`px-3 py-1 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                      {msgDate}
                                    </span>
                                  </div>
                                )}
                                
                                <Message
                                  message={msg}
                                  isOwn={msg.sender_id === currentUser?.id}
                                  isDark={isDark}
                                  otherUser={selectedConversation.otherUser}
                                />
                              </React.Fragment>
                            );
                          });
                        })()}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  <MessageInput
                    onSend={handleSendMessage}
                    disabled={!selectedConversation}
                    isDark={isDark}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mx-auto mb-6">
                      <HiOutlineChat className="w-16 h-16 text-rose-500" />
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Welcome to Messages
                    </h3>
                    <p className={`text-sm max-w-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
              <h2 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedConversation.otherUser?.full_name || 
                 `${selectedConversation.otherUser?.first_name || ''} ${selectedConversation.otherUser?.last_name || ''}`.trim()}
              </h2>
              {selectedConversation.otherUser?.university_name && (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedConversation.otherUser.university_name}
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

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
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

textarea::-webkit-scrollbar {
  width: 4px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}

kbd {
  font-family: monospace;
  font-size: 0.7rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  background: rgba(156, 163, 175, 0.2);
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Messages;