// services/messageService.js
import { supabase } from '../lib/supabaseClient';

export const messageService = {
  async sendMessage(senderId, receiverId, content) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content: content,
          status: 'sent'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  },

  async getConversations(userId) {
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
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .neq('status', 'declined')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!messages || messages.length === 0) {
        return { success: true, data: [] };
      }

      const userIds = new Set();
      messages.forEach(msg => {
        if (msg.sender_id !== userId) userIds.add(msg.sender_id);
        if (msg.receiver_id !== userId) userIds.add(msg.receiver_id);
      });

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, full_name, photo_url')
        .in('id', Array.from(userIds));

      if (usersError) throw usersError;

      const userMap = new Map();
      users.forEach(user => {
        userMap.set(user.id, user);
      });

      const conversationsMap = new Map();

      messages.forEach(msg => {
        const isSender = msg.sender_id === userId;
        const otherUserId = isSender ? msg.receiver_id : msg.sender_id;
        const otherUser = userMap.get(otherUserId);
        
        if (!otherUser) return;

        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            id: otherUserId,
            otherUserId: otherUserId,
            otherUser: {
              ...otherUser,
              full_name: otherUser.full_name || `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim()
            },
            lastMessage: msg,
            unreadCount: msg.receiver_id === userId && msg.status === 'sent' ? 1 : 0
          });
        } else {
          const conv = conversationsMap.get(otherUserId);
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