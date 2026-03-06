// pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import { 
  HiOutlineHeart, 
  HiOutlineChat,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineLocationMarker,
  HiOutlineSparkles,
  HiOutlineStar,
  HiOutlineFire,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineFilter,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineEye,
  HiOutlineThumbUp,
  HiOutlineUserAdd,
  HiOutlineMail,
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineCalendar,
  HiOutlinePhotograph,
  HiOutlineFlag,
  HiOutlineDotsCircleHorizontal
} from 'react-icons/hi';

const Notifications = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'mentions'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    date: 'all'
  });

  // Sample notifications data
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const sampleNotifications = [
        {
          id: 1,
          type: 'like',
          user: {
            id: 101,
            name: 'Emma Watson',
            image: 'https://images.unsplash.com/photo-1494790108777-406d7f1f3a9f?w=200',
            university: 'Stanford University'
          },
          content: 'liked your profile',
          timestamp: '2 min ago',
          date: '2024-03-07',
          read: false,
          actionable: true,
          icon: HiOutlineHeart,
          iconColor: 'text-rose-500',
          bgColor: 'bg-rose-500/10'
        },
        {
          id: 2,
          type: 'match',
          user: {
            id: 102,
            name: 'Sophia Chen',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
            university: 'UC Berkeley'
          },
          content: 'You have a new match!',
          timestamp: '15 min ago',
          date: '2024-03-07',
          read: false,
          actionable: true,
          icon: HiOutlineUserAdd,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-500/10'
        },
        {
          id: 3,
          type: 'message',
          user: {
            id: 103,
            name: 'Olivia Martinez',
            image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200',
            university: 'UCLA'
          },
          content: 'sent you a message: "Hey! I saw we have similar interests..."',
          timestamp: '1 hour ago',
          date: '2024-03-07',
          read: true,
          actionable: true,
          icon: HiOutlineChat,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-500/10'
        },
        {
          id: 4,
          type: 'view',
          user: {
            id: 104,
            name: 'Isabella Kim',
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            university: 'USC'
          },
          content: 'viewed your profile',
          timestamp: '3 hours ago',
          date: '2024-03-07',
          read: true,
          actionable: false,
          icon: HiOutlineEye,
          iconColor: 'text-purple-500',
          bgColor: 'bg-purple-500/10'
        },
        {
          id: 5,
          type: 'verification',
          user: {
            id: 105,
            name: 'MatchMaker Team',
            image: null,
            university: null
          },
          content: 'Your student ID has been verified! You can now access all features.',
          timestamp: '1 day ago',
          date: '2024-03-06',
          read: false,
          actionable: true,
          icon: HiOutlineCheckCircle,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-500/10'
        },
        {
          id: 6,
          type: 'like',
          user: {
            id: 106,
            name: 'Mia Thompson',
            image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
            university: 'NYU'
          },
          content: 'liked your profile',
          timestamp: '1 day ago',
          date: '2024-03-06',
          read: true,
          actionable: true,
          icon: HiOutlineHeart,
          iconColor: 'text-rose-500',
          bgColor: 'bg-rose-500/10'
        },
        {
          id: 7,
          type: 'birthday',
          user: {
            id: 107,
            name: 'Charlotte Brown',
            image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
            university: 'Columbia University'
          },
          content: 'has a birthday today! Send them a wish.',
          timestamp: '2 days ago',
          date: '2024-03-05',
          read: true,
          actionable: true,
          icon: HiOutlineCalendar,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10'
        },
        {
          id: 8,
          type: 'match',
          user: {
            id: 108,
            name: 'Amelia Davis',
            image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200',
            university: 'University of Chicago'
          },
          content: 'You have a new match!',
          timestamp: '3 days ago',
          date: '2024-03-04',
          read: true,
          actionable: true,
          icon: HiOutlineUserAdd,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-500/10'
        },
        {
          id: 9,
          type: 'mention',
          user: {
            id: 109,
            name: 'Evelyn Rodriguez',
            image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200',
            university: 'University of Miami'
          },
          content: 'mentioned you in a comment: "Totally agree with @you about..."',
          timestamp: '4 days ago',
          date: '2024-03-03',
          read: true,
          actionable: true,
          icon: HiOutlineFlag,
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-500/10'
        },
        {
          id: 10,
          type: 'system',
          user: {
            id: 110,
            name: 'MatchMaker Team',
            image: null,
            university: null
          },
          content: 'New features available! Check out the latest updates.',
          timestamp: '5 days ago',
          date: '2024-03-02',
          read: true,
          actionable: true,
          icon: HiOutlineSparkles,
          iconColor: 'text-purple-500',
          bgColor: 'bg-purple-500/10'
        },
        {
          id: 11,
          type: 'photo',
          user: {
            id: 111,
            name: 'Emma Watson',
            image: 'https://images.unsplash.com/photo-1494790108777-406d7f1f3a9f?w=200',
            university: 'Stanford University'
          },
          content: 'added a new photo to their profile',
          timestamp: '6 days ago',
          date: '2024-03-01',
          read: true,
          actionable: true,
          icon: HiOutlinePhotograph,
          iconColor: 'text-indigo-500',
          bgColor: 'bg-indigo-500/10'
        },
        {
          id: 12,
          type: 'like',
          user: {
            id: 112,
            name: 'Sophia Chen',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
            university: 'UC Berkeley'
          },
          content: 'liked your profile',
          timestamp: '1 week ago',
          date: '2024-02-29',
          read: true,
          actionable: true,
          icon: HiOutlineHeart,
          iconColor: 'text-rose-500',
          bgColor: 'bg-rose-500/10'
        }
      ];

      setNotifications(sampleNotifications);
      setFilteredNotifications(sampleNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter notifications based on active tab and filters
  useEffect(() => {
    let filtered = [...notifications];

    // Filter by tab
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (activeTab === 'mentions') {
      filtered = filtered.filter(n => n.type === 'mention' || n.type === 'message');
    }

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    // Filter by date
    if (filters.date !== 'all') {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      filtered = filtered.filter(n => {
        const notifDate = new Date(n.date);
        if (filters.date === 'today') {
          return notifDate >= today;
        } else if (filters.date === 'yesterday') {
          return notifDate >= yesterday && notifDate < today;
        } else if (filters.date === 'week') {
          return notifDate >= weekAgo;
        }
        return true;
      });
    }

    setFilteredNotifications(filtered);
  }, [activeTab, filters, notifications]);

  const getCardStyles = () => {
    return isDark
      ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
      : 'bg-white border-gray-100 hover:border-rose-200';
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

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    markAsRead(notification.id);

    // Navigate based on notification type
    switch(notification.type) {
      case 'like':
      case 'view':
      case 'match':
        navigate(`/profile/${notification.user.id}`);
        break;
      case 'message':
        navigate('/messages');
        break;
      case 'verification':
        navigate('/profile');
        break;
      case 'system':
        navigate('/updates');
        break;
      default:
        // Do nothing or navigate to general notifications
        break;
    }
  };

  const getNotificationIcon = (notification) => {
    const Icon = notification.icon;
    return (
      <div className={`w-10 h-10 rounded-full ${notification.bgColor} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${notification.iconColor}`} />
      </div>
    );
  };

  const getTimeAgo = (timestamp) => {
    return timestamp;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className={`animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4 ${
              isDark ? 'border-gray-700 border-t-rose-500' : 'border-gray-200 border-t-rose-500'
            }`}></div>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  Stay updated with your matches and activity
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition text-sm ${
                    isDark
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                  }`}
                >
                  <HiOutlineCheckCircle className="w-4 h-4" />
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                  isDark
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                }`}
              >
                <HiOutlineFilter className="w-5 h-5" />
                Filter
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className={`mt-4 p-4 rounded-xl border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Type Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${getTextStyles()}`}>
                    Notification Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">All Types</option>
                    <option value="like">Likes</option>
                    <option value="match">Matches</option>
                    <option value="message">Messages</option>
                    <option value="view">Profile Views</option>
                    <option value="verification">Verification</option>
                    <option value="system">System</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${getTextStyles()}`}>
                    Time Period
                  </label>
                  <select
                    value={filters.date}
                    onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">Last 7 Days</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setFilters({ type: 'all', date: 'all' })}
                  className={`text-sm flex items-center gap-1 ${
                    isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <HiOutlineRefresh className="w-4 h-4" />
                  Clear filters
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={getActiveTabStyles('all')}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={getActiveTabStyles('unread')}
            >
              Unread
              {unreadCount > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === 'unread' ? 'bg-white text-rose-500' : 'bg-rose-500 text-white'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('mentions')}
              className={getActiveTabStyles('mentions')}
            >
              Mentions & Messages
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
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative rounded-xl transition-all duration-200 cursor-pointer ${
                  !notification.read && !isDark ? 'bg-rose-50/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                  !notification.read
                    ? isDark
                      ? 'bg-gray-800/80 border-rose-500/30'
                      : 'bg-white border-rose-200 shadow-sm'
                    : getCardStyles()
                }`}>
                  <div className="flex gap-4">
                    {/* Icon */}
                    {getNotificationIcon(notification)}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm sm:text-base ${getTextStyles()}`}>
                            {notification.user.name && (
                              <span className="font-semibold">{notification.user.name} </span>
                            )}
                            <span className={getSubtextStyles()}>{notification.content}</span>
                          </p>
                          {notification.user.university && (
                            <p className={`text-xs mt-1 flex items-center gap-1 ${getSubtextStyles()}`}>
                              <HiOutlineAcademicCap className="w-3 h-3" />
                              {notification.user.university}
                            </p>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs ${getSubtextStyles()}`}>
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          
                          {/* Unread indicator */}
                          {!notification.read && (
                            <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {notification.actionable && (
                        <div className="flex gap-2 mt-3">
                          {notification.type === 'like' && (
                            <button className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                              isDark
                                ? 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30'
                                : 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                            }`}>
                              Like Back
                            </button>
                          )}
                          {notification.type === 'match' && (
                            <button className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                              isDark
                                ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}>
                              Send Message
                            </button>
                          )}
                          {notification.type === 'message' && (
                            <button className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                              isDark
                                ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            }`}>
                              Reply
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                              isDark
                                ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredNotifications.length > 0 && filteredNotifications.length < notifications.length && (
          <div className="text-center mt-8">
            <button
              className={`px-6 py-3 rounded-xl font-medium transition ${
                isDark
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;