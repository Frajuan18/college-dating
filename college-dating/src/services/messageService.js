// services/messageService.js
import { supabase } from '../lib/supabaseClient';

export const messageService = {
  // Send a new message
  async sendMessage(senderId, receiverId, content) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: senderId,
            receiver_id: receiverId,
            content: content,
            status: 'sent',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  },

  // Get conversations for a user
  async getConversations(userId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, first_name, last_name, full_name, photo_url, university_name),
          receiver:receiver_id(id, first_name, last_name, full_name, photo_url, university_name)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { success: false, error: error.message };
    }
  },

  // Get messages between two users
  async getMessages(userId1, userId2) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { success: false, error: error.message };
    }
  },

  // Get message requests (unread messages)
  async getMessageRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, first_name, last_name, full_name, photo_url, university_name)
        `)
        .eq('receiver_id', userId)
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching message requests:', error);
      return { success: false, error: error.message };
    }
  },

  // Accept a message request
  async acceptMessage(messageId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ status: 'accepted' })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error accepting message:', error);
      return { success: false, error: error.message };
    }
  },

  // Decline a message request
  async declineMessage(messageId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ status: 'declined' })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error declining message:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark message as read
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
  }
};