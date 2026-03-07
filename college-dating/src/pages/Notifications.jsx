// pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import MessageModal from '../components/MessagesModal';
import { 
  HiOutlineChat,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineSearch,
  HiOutlinePaperAirplane,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineReply
} from 'react-icons/hi';

const Notifications = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

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
      await fetchConversations(userData.id);
      await fetchIncomingRequests(userData.id);
      
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('telegramId');
      navigate('/login');
    }
  };

  const fetchConversations = async (userId) => {
    try {
      // Fetch all messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, first_name, last_name, full_name, photo_url, university_name),
          receiver:receiver_id(id, first_name, last_name, full_name, photo_url, university_name)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation
      const conversationMap = new Map();

      messages.forEach(msg => {
        const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
        const conversationId = [msg.sender_id, msg.receiver_id].sort().join('_');
        
        if (!conversationMap.has(conversationId)) {
          conversationMap.set(conversationId, {
            id: conversationId,
            otherUser: otherUser,
            lastMessage: msg,
            unreadCount: msg.receiver_id === userId && msg.status === 'sent' ? 1 : 0,
            messages: [msg]
          });
        } else {
          const conv = conversationMap.get(conversationId);
          conv.messages.push(msg);
          if (msg.receiver_id === userId && msg.status === 'sent') {
            conv.unreadCount++;
          }
          // Keep the latest message as lastMessage
          if (new Date(msg.created_at) > new Date(conv.lastMessage.created_at)) {
            conv.lastMessage = msg;
          }
        }
      });

      // Convert map to array and sort by last message time
      const conversationsArray = Array.from(conversationMap.values());
      conversationsArray.sort((a, b) => 
        new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
      );

      setConversations(conversationsArray);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchIncomingRequests = async (userId) => {
    try {
      // Fetch messages that are pending (not accepted/rejected)
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

      setIncomingRequests(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    // Mark messages as read
    if (conversation.unreadCount > 0) {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('receiver_id', currentUser.id)
        .eq('sender_id', conversation.otherUser.id);

      if (!error) {
        // Update local state
        setConversations(prev => prev.map(c => 
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        ));
      }
    }

    // Sort messages in this conversation
    const sortedMessages = conversation.messages.sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );
    setMessages(sortedMessages);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: currentUser.id,
            receiver_id: selectedConversation.otherUser.id,
            content: newMessage,
            status: 'sent',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      // Update local state
      const newMsg = data[0];
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');

      // Update conversation list
      setConversations(prev => {
        const updated = prev.map(c => 
          c.id === selectedConversation.id 
            ? { 
                ...c, 
                lastMessage: newMsg,
                messages: [...c.messages, newMsg]
              }
            : c
        );
        return updated.sort((a, b) => 
          new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
        );
      });

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleAcceptRequest = async (request) => {
    try {
      // Update message status to 'accepted'
      const { error } = await supabase
        .from('messages')
        .update({ status: 'accepted' })
        .eq('id', request.id);

      if (error) throw error;

      // Remove from requests
      setIncomingRequests(prev => prev.filter(r => r.id !== request.id));

      // Add to conversations
      const otherUser = {
        id: request.sender_id,
        first_name: request.sender.first_name,
        last_name: request.sender.last_name,
        full_name: request.sender.full_name,
        photo_url: request.sender.photo_url,
        university_name: request.sender.university_name
      };

      const conversationId = [request.sender_id, currentUser.id].sort().join('_');
      
      setConversations(prev => {
        const existing = prev.find(c => c.id === conversationId);
        if (existing) {
          return prev.map(c => 
            c.id === conversationId 
              ? { ...c, lastMessage: request, messages: [...c.messages, request] }
              : c
          );
        } else {
          return [{
            id: conversationId,
            otherUser: otherUser,
            lastMessage: request,
            unreadCount: 0,
            messages: [request]
          }, ...prev];
        }
      });

    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (request) => {
    try {
      // Update message status to 'declined'
      const { error } = await supabase
        .from('messages')
        .update({ status: 'declined' })
        .eq('id', request.id);

      if (error) throw error;

      // Remove from requests
      setIncomingRequests(prev => prev.filter(r => r.id !== request.id));

    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const handleSendMessageToMatch = async (receiverId, content) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: currentUser.id,
            receiver_id: receiverId,
            content: content,
            status: 'sent',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      // Refresh conversations
      await fetchConversations(currentUser.id);
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.otherUser.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
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

        {/* Incoming Requests */}
        {incomingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className={`text-lg font-semibold mb-4 ${getTextStyles()}`}>
              Message Requests ({incomingRequests.length})
            </h2>
            <div className="space-y-3">
              {incomingRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 rounded-xl border-2 border-rose-500/50 ${getCardStyles()}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                      {request.sender.photo_url ? (
                        <img src={request.sender.photo_url} alt={request.sender.first_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-600">
                          {request.sender.first_name?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${getTextStyles()}`}>
                        {request.sender.full_name || `${request.sender.first_name} ${request.sender.last_name}`}
                      </h3>
                      <p className={`text-sm ${getSubtextStyles()}`}>
                        {request.content}
                      </p>
                      <p className={`text-xs mt-1 ${getSubtextStyles()}`}>
                        {formatTime(request.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request)}
                        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
                        title="Accept"
                      >
                        <HiOutlineCheck className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                        title="Decline"
                      >
                        <HiOutlineX className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Layout */}
        <div className={`rounded-xl overflow-hidden border ${getCardStyles()}`}>
          <div className="flex flex-col md:flex-row h-[600px]">
            {/* Conversations List */}
            <div className={`w-full md:w-80 border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Search */}
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

              {/* Conversations */}
              <div className="overflow-y-auto h-[calc(600px-73px)]">
                {filteredConversations.length === 0 ? (
                  <div className={`text-center py-8 ${getSubtextStyles()}`}>
                    <HiOutlineChat className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-4 cursor-pointer transition ${
                        selectedConversation?.id === conv.id
                          ? isDark ? 'bg-gray-700' : 'bg-rose-50'
                          : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                            {conv.otherUser.photo_url ? (
                              <img src={conv.otherUser.photo_url} alt={conv.otherUser.first_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-600">
                                {conv.otherUser.first_name?.[0] || 'U'}
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
                              {conv.otherUser.full_name || `${conv.otherUser.first_name} ${conv.otherUser.last_name}`}
                            </h3>
                            <span className={`text-xs ml-2 ${getSubtextStyles()}`}>
                              {formatTime(conv.lastMessage.created_at)}
                            </span>
                          </div>
                          <p className={`text-sm truncate ${
                            conv.unreadCount > 0 
                              ? isDark ? 'text-white font-medium' : 'text-gray-900 font-medium'
                              : getSubtextStyles()
                          }`}>
                            {conv.lastMessage.sender_id === currentUser.id ? 'You: ' : ''}
                            {conv.lastMessage.content}
                          </p>
                          {conv.otherUser.university_name && (
                            <p className={`text-xs mt-1 ${getSubtextStyles()}`}>
                              {conv.otherUser.university_name}
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
            {selectedConversation ? (
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                      {selectedConversation.otherUser.photo_url ? (
                        <img src={selectedConversation.otherUser.photo_url} alt={selectedConversation.otherUser.first_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-600">
                          {selectedConversation.otherUser.first_name?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${getTextStyles()}`}>
                        {selectedConversation.otherUser.full_name || `${selectedConversation.otherUser.first_name} ${selectedConversation.otherUser.last_name}`}
                      </h3>
                      <p className={`text-xs ${getSubtextStyles()}`}>
                        {selectedConversation.otherUser.university_name || 'University Student'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, index) => {
                    const isOwn = msg.sender_id === currentUser.id;
                    return (
                      <div
                        key={index}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
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
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className={`text-xs ${
                              isOwn 
                                ? 'text-rose-100' 
                                : isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {formatTime(msg.created_at)}
                            </span>
                            {isOwn && (
                              <span className={`text-xs ${
                                msg.status === 'sent' ? 'text-rose-100' :
                                msg.status === 'read' ? 'text-green-300' :
                                msg.status === 'accepted' ? 'text-green-300' :
                                'text-rose-100'
                              }`}>
                                •
                                {msg.status === 'sent' && ' Sent'}
                                {msg.status === 'read' && ' Read'}
                                {msg.status === 'accepted' && ' Accepted'}
                                {msg.status === 'declined' && ' Declined'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className={`p-2 rounded-lg transition ${
                        sending || !newMessage.trim()
                          ? isDark
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : isDark
                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                            : 'bg-rose-500 text-white hover:bg-rose-600'
                      }`}
                    >
                      <HiOutlinePaperAirplane className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
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

      {/* Message Modal */}
      {showMessageModal && selectedMatch && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedMatch(null);
          }}
          match={selectedMatch}
          currentUser={currentUser}
          onSendMessage={handleSendMessageToMatch}
        />
      )}
    </div>
  );
};

export default Notifications;