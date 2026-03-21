// services/messageService.js
import { supabase } from '../lib/supabaseClient';

export const messageService = {
  /**
   * Send a new message
   */
  async sendMessage(senderId, receiverId, content) {
    try {
      // Check if there's an existing accepted conversation
      const { data: existingMessages, error: checkError } = await supabase
        .from('messages')
        .select('id, status')
        .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
        .in('status', ['read', 'accepted'])
        .limit(1);

      if (checkError) throw checkError;

      // Determine message status
      const hasExistingConversation = existingMessages && existingMessages.length > 0;
      const status = hasExistingConversation ? 'read' : 'sent';

      // Insert the message
      const { data: message, error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content: content,
          status: status,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return { success: true, data: message };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all conversations for a user
   */
  async getConversations(userId) {
    try {
      // Get all messages where user is involved
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          status,
          created_at,
          sender_id,
          receiver_id
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .neq('status', 'declined')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!messages || messages.length === 0) {
        return { success: true, data: [] };
      }

      // Get unique user IDs from conversations
      const userIds = new Set();
      messages.forEach(msg => {
        if (msg.sender_id !== userId) userIds.add(msg.sender_id);
        if (msg.receiver_id !== userId) userIds.add(msg.receiver_id);
      });

      // Fetch user details for all participants
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, full_name, photo_url, telegram_id')
        .in('id', Array.from(userIds));

      if (usersError) throw usersError;

      // Create a map of user details
      const userMap = new Map();
      users.forEach(user => {
        userMap.set(user.id, user);
      });

      // Also fetch verification info for users
      const { data: verifications, error: verifError } = await supabase
        .from('student_verifications')
        .select('user_id, university_name, department, student_year')
        .in('user_id', Array.from(userIds))
        .eq('status', 'approved');

      const verificationMap = new Map();
      if (verifications) {
        verifications.forEach(verif => {
          verificationMap.set(verif.user_id, verif);
        });
      }

      // Group messages by conversation
      const conversationsMap = new Map();

      messages.forEach(msg => {
        const isSender = msg.sender_id === userId;
        const otherUserId = isSender ? msg.receiver_id : msg.sender_id;
        const otherUser = userMap.get(otherUserId);
        
        if (!otherUser) return;

        // Add university info if available
        const verification = verificationMap.get(otherUserId);
        const otherUserWithDetails = {
          ...otherUser,
          university_name: verification?.university_name || null,
          department: verification?.department || null,
          student_year: verification?.student_year || null,
          full_name: otherUser.full_name || `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || 'User'
        };

        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            id: otherUserId,
            otherUserId: otherUserId,
            otherUser: otherUserWithDetails,
            lastMessage: msg,
            unreadCount: msg.receiver_id === userId && msg.status === 'sent' ? 1 : 0,
            messages: [msg]
          });
        } else {
          const conv = conversationsMap.get(otherUserId);
          conv.messages.push(msg);
          if (msg.receiver_id === userId && msg.status === 'sent') {
            conv.unreadCount += 1;
          }
          if (new Date(msg.created_at) > new Date(conv.lastMessage.created_at)) {
            conv.lastMessage = msg;
          }
        }
      });

      const conversations = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at));

      return { success: true, data: conversations };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Get messages between two users
   */
  async getMessages(userId, otherUserId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .neq('status', 'declined')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Get pending message requests
   */
  async getMessageRequests(userId) {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          status,
          created_at,
          sender_id,
          receiver_id
        `)
        .eq('receiver_id', userId)
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!messages || messages.length === 0) {
        return { success: true, data: [] };
      }

      // Get sender details
      const senderIds = messages.map(msg => msg.sender_id);
      const { data: senders, error: sendersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, full_name, photo_url, telegram_id')
        .in('id', senderIds);

      if (sendersError) throw sendersError;

      // Get verification info for senders
      const { data: verifications, error: verifError } = await supabase
        .from('student_verifications')
        .select('user_id, university_name, department, student_year')
        .in('user_id', senderIds)
        .eq('status', 'approved');

      const verificationMap = new Map();
      if (verifications) {
        verifications.forEach(verif => {
          verificationMap.set(verif.user_id, verif);
        });
      }

      // Create a map of senders
      const senderMap = new Map();
      senders.forEach(sender => {
        const verification = verificationMap.get(sender.id);
        senderMap.set(sender.id, {
          ...sender,
          university_name: verification?.university_name || null,
          full_name: sender.full_name || `${sender.first_name || ''} ${sender.last_name || ''}`.trim() || 'User'
        });
      });

      // Combine messages with sender details
      const requests = messages.map(msg => ({
        ...msg,
        sender: senderMap.get(msg.sender_id)
      }));

      return { success: true, data: requests };
    } catch (error) {
      console.error('Error fetching message requests:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Accept a message request
   */
  async acceptMessage(messageId) {
    try {
      // Get the message to find sender and receiver
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('sender_id, receiver_id')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      // Update all messages between these users to 'read'
      const { error: updateError } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .or(`and(sender_id.eq.${message.sender_id},receiver_id.eq.${message.receiver_id}),and(sender_id.eq.${message.receiver_id},receiver_id.eq.${message.sender_id})`);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      console.error('Error accepting message:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Decline a message request
   */
  async declineMessage(messageId) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'declined' })
        .eq('id', messageId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error declining message:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Mark message as read
   */
  async markAsRead(messageId) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error marking message as read:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('status', 'sent');

      if (error) throw error;

      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Error getting unread count:', error);
      return { success: false, count: 0 };
    }
  },

  /**
   * Subscribe to new messages
   */
  subscribeToMessages(userId, onNewMessage) {
    const subscription = supabase
      .channel(`messages_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const newMessage = payload.new;
          
          // Fetch sender details for the notification
          const { data: sender } = await supabase
            .from('users')
            .select('id, first_name, last_name, full_name, photo_url')
            .eq('id', newMessage.sender_id)
            .single();
          
          // Fetch verification info
          const { data: verification } = await supabase
            .from('student_verifications')
            .select('university_name')
            .eq('user_id', newMessage.sender_id)
            .eq('status', 'approved')
            .single();
          
          onNewMessage({
            ...newMessage,
            sender: {
              ...sender,
              full_name: sender?.full_name || `${sender?.first_name || ''} ${sender?.last_name || ''}`.trim() || 'User',
              university_name: verification?.university_name
            }
          });
        }
      )
      .subscribe();

    return subscription;
  }
};