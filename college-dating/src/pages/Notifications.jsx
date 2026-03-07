// pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import { messageService } from '../services/messageService';
import Navbar from '../components/Navbar';
import { 
  HiOutlineMail,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineChat,
  HiOutlineBell
} from 'react-icons/hi';

const Notifications = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [messageRequests, setMessageRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'conversations'
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    checkUserAndFetch();
  }, []);

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
      await fetchMessageRequests(userData.id);
      await fetchConversations(userData.id);
      
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('telegramId');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageRequests = async (userId) => {
    try {
      const result = await messageService.getMessageRequests(userId);
      if (result.success) {
        setMessageRequests(result.data);
      }
    } catch (error) {
      console.error('Error fetching message requests:', error);
    }
  };

  const fetchConversations = async (userId) => {
    try {
      const result = await messageService.getConversations(userId);
      if (result.success) {
        setConversations(result.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleAcceptRequest = async (request) => {
    setProcessingId(request.id);
    
    try {
      const result = await messageService.acceptMessage(request.id);
      
      if (result.success) {
        // Remove from requests
        setMessageRequests(prev => prev.filter(r => r.id !== request.id));
        
        // Refresh conversations
        await fetchConversations(currentUser.id);
        
        alert('Request accepted! You can now reply.');
      } else {
        alert(result.error || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineRequest = async (request) => {
    setProcessingId(request.id);
    
    try {
      const result = await messageService.declineMessage(request.id);
      
      if (result.success) {
        // Remove from requests
        setMessageRequests(prev => prev.filter(r => r.id !== request.id));
        alert('Request declined');
      } else {
        alert(result.error || 'Failed to decline request');
      }
    } catch (error) {
      console.error('Error declining request:', error);
    } finally {
      setProcessingId(null);
    }
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
    return `${diffDays} days ago`;
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
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white shadow-md'
            }`}>
              <HiOutlineBell className={`w-6 h-6 ${
                isDark ? 'text-rose-400' : 'text-rose-500'
              }`} />
            </div>
            <div>
              <h1 className={`text-3xl sm:text-4xl font-bold mb-1 ${getTextStyles()}`}>
                Notifications
              </h1>
              <p className={`text-sm sm:text-base ${getSubtextStyles()}`}>
                {messageRequests.length} pending requests • {conversations.length} conversations
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'requests'
                  ? 'bg-rose-500 text-white shadow-lg'
                  : isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
              }`}
            >
              Requests
              {messageRequests.length > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === 'requests' 
                    ? 'bg-white text-rose-500' 
                    : 'bg-rose-500 text-white'
                }`}>
                  {messageRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('conversations')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'conversations'
                  ? 'bg-rose-500 text-white shadow-lg'
                  : isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
              }`}
            >
              Conversations
              {conversations.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-500 text-white rounded-full">
                  {conversations.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {messageRequests.length === 0 ? (
              <div className={`text-center py-12 ${getSubtextStyles()}`}>
                <HiOutlineMail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No message requests</p>
                <p className="text-sm">When someone sends you a message, it will appear here</p>
              </div>
            ) : (
              messageRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 rounded-xl border-2 border-rose-500/50 ${getCardStyles()}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Sender Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                      {request.sender?.photo_url ? (
                        <img 
                          src={request.sender.photo_url} 
                          alt={request.sender.first_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-600">
                          {request.sender?.first_name?.[0] || 'U'}
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${getTextStyles()}`}>
                          {request.sender?.full_name || 
                           `${request.sender?.first_name || ''} ${request.sender?.last_name || ''}`.trim() || 
                           'Unknown User'}
                        </h3>
                        <span className={`text-xs ${getSubtextStyles()}`}>
                          {formatTime(request.created_at)}
                        </span>
                      </div>
                      
                      {request.sender?.university_name && (
                        <p className={`text-xs mb-2 flex items-center gap-1 ${getSubtextStyles()}`}>
                          <HiOutlineAcademicCap className="w-3 h-3" />
                          {request.sender.university_name}
                        </p>
                      )}

                      <p className={`text-sm mb-3 p-3 rounded-lg ${
                        isDark ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        {request.content}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request)}
                          disabled={processingId === request.id}
                          className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                            isDark
                              ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          } ${processingId === request.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {processingId === request.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
                          ) : (
                            <HiOutlineCheck className="w-4 h-4" />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request)}
                          disabled={processingId === request.id}
                          className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                            isDark
                              ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          } ${processingId === request.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <HiOutlineX className="w-4 h-4" />
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="space-y-4">
            {conversations.length === 0 ? (
              <div className={`text-center py-12 ${getSubtextStyles()}`}>
                <HiOutlineChat className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No conversations yet</p>
                <p className="text-sm">Go to matches and start a conversation!</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-4 rounded-xl cursor-pointer transition hover:shadow-md ${getCardStyles()}`}
                  onClick={() => {/* Navigate to chat detail */}}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
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
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${getTextStyles()}`}>
                          {conv.otherUser?.full_name || 
                           `${conv.otherUser?.first_name || ''} ${conv.otherUser?.last_name || ''}`.trim() || 
                           'Unknown User'}
                        </h3>
                        <span className={`text-xs ${getSubtextStyles()}`}>
                          {formatTime(conv.lastMessage?.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${getSubtextStyles()}`}>
                        {conv.lastMessage?.sender_id === currentUser?.id ? 'You: ' : ''}
                        {conv.lastMessage?.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full">
                          {conv.unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;