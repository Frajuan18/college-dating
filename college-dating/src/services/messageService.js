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
      // Get all messages where user is involved and status is not declined
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          status,
          created_at,
          sender_id,
          receiver_id,
          sender:users!messages_sender_id_fkey(
            id, 
            first_name, 
            last_name, 
            full_name, 
            photo_url, 
            telegram_id,
            university_name
          ),
          receiver:users!messages_receiver_id_fkey(
            id, 
            first_name, 
            last_name, 
            full_name, 
            photo_url, 
            telegram_id,
            university_name
          )
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .neq('status', 'declined')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation
      const conversationsMap = new Map();

      messages.forEach(msg => {
        const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
        const conversationId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;

        if (!conversationsMap.has(conversationId)) {
          conversationsMap.set(conversationId, {
            id: conversationId,
            otherUserId: conversationId,
            otherUser: otherUser,
            lastMessage: msg,
            unreadCount: msg.receiver_id === userId && msg.status === 'sent' ? 1 : 0,
            messages: [msg]
          });
        } else {
          const conv = conversationsMap.get(conversationId);
          conv.messages.push(msg);
          
          // Update unread count
          if (msg.receiver_id === userId && msg.status === 'sent') {
            conv.unreadCount += 1;
          }
          
          // Keep latest message as lastMessage
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
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          status,
          created_at,
          sender_id,
          receiver_id,
          sender:users!messages_sender_id_fkey(
            id, 
            first_name, 
            last_name, 
            full_name, 
            photo_url, 
            telegram_id, 
            university_name,
            department,
            verification_status
          )
        `)
        .eq('receiver_id', userId)
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
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
        (payload) => {
          onNewMessage(payload.new);
        }
      )
      .subscribe();

    return subscription;
  }
};