// pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import { 
  HiOutlineHeart, 
  HiOutlineChat,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineReply,
  HiOutlineBell,
  HiOutlineMail,
  HiOutlineUserAdd,
  HiOutlineEye,
  HiOutlineStar,
  HiOutlineSparkles
} from 'react-icons/hi';

const Notifications = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [messageRequests, setMessageRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'requests', 'messages'
  const [searchQuery, setSearchQuery] = useState('');
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
      await fetchNotifications(userData.id);
      await fetchMessageRequests(userData.id);
      
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('telegramId');
      navigate('/login');
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      // Fetch all types of notifications
      // 1. Messages where user is receiver (for message requests)
      // 2. System notifications
      // 3. Like notifications (if you have that feature)
      
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, first_name, last_name, full_name, photo_url, university_name)
        `)
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Format messages as notifications
      const messageNotifications = messages.map(msg => ({
        id: `msg_${msg.id}`,
        type: 'message',
        title: `Message from ${msg.sender.full_name || msg.sender.first_name}`,
        content: msg.content,
        sender: msg.sender,
        status: msg.status,
        timestamp: msg.created_at,
        read: msg.status !== 'sent', // Consider 'sent' as unread
        actionable: msg.status === 'sent',
        icon: HiOutlineMail,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        data: msg
      }));

      // You can add more notification types here
      // For now, just message notifications
      
      // Sort by timestamp (newest first)
      const allNotifications = [...messageNotifications].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setNotifications(allNotifications);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const fetchMessageRequests = async (userId) => {
    try {
      // Fetch messages that are pending (status 'sent')
      const { data: requests, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, first_name, last_name, full_name, photo_url, university_name)
        `)
        .eq('receiver_id', userId)
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMessageRequests(requests);
      
    } catch (error) {
      console.error('Error fetching message requests:', error);
    }
  };

  const handleAcceptRequest = async (request) => {
    setProcessingId(request.id);
    
    try {
      // Update message status to 'accepted'
      const { error } = await supabase
        .from('messages')
        .update({ status: 'accepted' })
        .eq('id', request.id);

      if (error) throw error;

      // Remove from requests
      setMessageRequests(prev => prev.filter(r => r.id !== request.id));
      
      // Update notifications
      setNotifications(prev => 
        prev.map(n => 
          n.data?.id === request.id 
            ? { ...n, status: 'accepted', actionable: false }
            : n
        )
      );

      // Show success (you can add a toast notification here)
      console.log('Request accepted');
      
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineRequest = async (request) => {
    setProcessingId(request.id);
    
    try {
      // Update message status to 'declined'
      const { error } = await supabase
        .from('messages')
        .update({ status: 'declined' })
        .eq('id', request.id);

      if (error) throw error;

      // Remove from requests
      setMessageRequests(prev => prev.filter(r => r.id !== request.id));
      
      // Update notifications
      setNotifications(prev => 
        prev.map(n => 
          n.data?.id === request.id 
            ? { ...n, status: 'declined', actionable: false }
            : n
        )
      );

      console.log('Request declined');
      
    } catch (error) {
      console.error('Error declining request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReply = (sender) => {
    // Navigate to messages page with this conversation
    navigate('/messages', { state: { userId: sender.id } });
  };

  const markAsRead = async (notification) => {
    if (notification.type === 'message' && notification.status === 'sent') {
      // Update message status to 'read'
      try {
        await supabase
          .from('messages')
          .update({ status: 'read' })
          .eq('id', notification.data.id);
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
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

  const getActiveTabStyles = (tab) => {
    const baseStyles = "px-4 py-2 rounded-full text-sm font-medium transition-all";
    if (activeTab === tab) {
      return `${baseStyles} bg-rose-500 text-white shadow-lg`;
    }
    return `${baseStyles} ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'}`;
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
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getFilteredNotifications = () => {
    let filtered = [...notifications];

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.sender?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.sender?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab === 'requests') {
      filtered = filtered.filter(n => n.type === 'message' && n.status === 'sent');
    } else if (activeTab === 'messages') {
      filtered = filtered.filter(n => n.type === 'message' && n.status !== 'sent');
    }

    return filtered;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const requestsCount = messageRequests.length;

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

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
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
                  {unreadCount} unread • {requestsCount} pending requests
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <HiOutlineSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border transition ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-rose-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-rose-500 shadow-sm'
              }`}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={getActiveTabStyles('all')}
            >
              All
              {unreadCount > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === 'all' ? 'bg-white text-rose-500' : 'bg-rose-500 text-white'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={getActiveTabStyles('requests')}
            >
              Requests
              {requestsCount > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === 'requests' ? 'bg-white text-rose-500' : 'bg-rose-500 text-white'
                }`}>
                  {requestsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={getActiveTabStyles('messages')}
            >
              Messages
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className={`text-center py-12 ${getSubtextStyles()}`}>
            <HiOutlineBell className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              
              return (
                <div
                  key={notification.id}
                  className={`relative rounded-xl transition-all duration-200 ${
                    !notification.read && !isDark ? 'bg-rose-50/50' : ''
                  }`}
                >
                  <div className={`p-4 rounded-xl border ${
                    !notification.read
                      ? isDark
                        ? 'bg-gray-800/80 border-rose-500/30'
                        : 'bg-white border-rose-200 shadow-sm'
                      : getCardStyles()
                  }`}>
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-full ${notification.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${notification.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${getTextStyles()}`}>
                                {notification.title}
                              </h3>
                              {notification.status === 'sent' && (
                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">
                                  New
                                </span>
                              )}
                              {notification.status === 'accepted' && (
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full">
                                  Accepted
                                </span>
                              )}
                              {notification.status === 'declined' && (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs rounded-full">
                                  Declined
                                </span>
                              )}
                            </div>
                            
                            {/* Sender Info */}
                            {notification.sender && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300">
                                  {notification.sender.photo_url ? (
                                    <img src={notification.sender.photo_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">
                                      {notification.sender.first_name?.[0] || 'U'}
                                    </div>
                                  )}
                                </div>
                                <span className={`text-sm font-medium ${getTextStyles()}`}>
                                  {notification.sender.full_name || `${notification.sender.first_name} ${notification.sender.last_name}`}
                                </span>
                                {notification.sender.university_name && (
                                  <>
                                    <span className={`text-xs ${getSubtextStyles()}`}>•</span>
                                    <span className={`text-xs ${getSubtextStyles()}`}>
                                      {notification.sender.university_name}
                                    </span>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Message Content */}
                            <p className={`text-sm mb-2 ${getSubtextStyles()}`}>
                              {notification.content}
                            </p>

                            {/* Timestamp */}
                            <p className={`text-xs flex items-center gap-1 ${getSubtextStyles()}`}>
                              <HiOutlineClock className="w-3 h-3" />
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>

                          {/* Unread indicator */}
                          {!notification.read && (
                            <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {notification.actionable && notification.type === 'message' && notification.status === 'sent' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleAcceptRequest(notification.data)}
                              disabled={processingId === notification.data.id}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                isDark
                                  ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                  : 'bg-green-100 text-green-600 hover:bg-green-200'
                              } ${processingId === notification.data.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {processingId === notification.data.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-green-500 border-t-transparent"></div>
                              ) : (
                                <HiOutlineCheck className="w-4 h-4" />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineRequest(notification.data)}
                              disabled={processingId === notification.data.id}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                isDark
                                  ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                                  : 'bg-red-100 text-red-600 hover:bg-red-200'
                              } ${processingId === notification.data.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <HiOutlineX className="w-4 h-4" />
                              Decline
                            </button>
                          </div>
                        )}

                        {notification.type === 'message' && notification.status === 'accepted' && (
                          <div className="mt-3">
                            <button
                              onClick={() => handleReply(notification.sender)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                isDark
                                  ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                              }`}
                            >
                              <HiOutlineReply className="w-4 h-4" />
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;