// hooks/useMessageNotifications.js
import { useState, useEffect } from 'react';
import { messageService } from '../services/messageService';

export const useMessageNotifications = (userId) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [newMessage, setNewMessage] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    const fetchUnreadCount = async () => {
      const result = await messageService.getUnreadCount(userId);
      if (result.success) {
        setUnreadCount(result.count);
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const subscription = messageService.subscribeToMessages(userId, (message) => {
      console.log('New message received:', message);
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Store notification
      setNewMessage(message);
      
      // Show browser notification if supported
      if (Notification.permission === 'granted') {
        // Fetch sender details
        fetchSenderDetails(message.sender_id).then(sender => {
          new Notification('New Message', {
            body: `${sender?.full_name || 'Someone'} sent: ${message.content.substring(0, 50)}`,
            icon: sender?.photo_url || '/default-avatar.png',
          });
        });
      }
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchSenderDetails = async (senderId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, photo_url')
        .eq('id', senderId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching sender:', error);
      return null;
    }
  };

  const clearNotification = (messageId) => {
    setNotifications(prev => prev.filter(n => n.id !== messageId));
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return {
    unreadCount,
    notifications,
    newMessage,
    clearNotification,
    resetUnreadCount,
  };
};