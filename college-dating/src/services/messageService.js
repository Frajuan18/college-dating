// services/messageService.js
import { supabase } from '../lib/supabaseClient';

export const messageService = {
  // Send a new message
  async sendMessage(senderId, receiverId, content) {
    try {
      console.log('Sending message:', { senderId, receiverId, content });

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
        .select(`
          *,
          sender:sender_id(id, first_name, last_name, full_name, photo_url, university_name),
          receiver:receiver_id(id, first_name, last_name, full_name, photo_url, university_name)
        `)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Message sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error sending message:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send message',
        details: error
      };
    }
  },

  // Get all conversations for a user
  async getConversations(userId) {
    try {
      console.log('Fetching conversations for user:', userId);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(
            id, 
            first_name, 
            last_name, 
            full_name, 
            photo_url, 
            university_name
          ),
          receiver:receiver_id(
            id, 
            first_name, 
            last_name, 
            full_name, 
            photo_url, 
            university_name
          )
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Group messages by conversation
      const conversations = [];
      const conversationMap = new Map();

      data.forEach(message => {
        const otherUser = message.sender_id === userId ? message.receiver : message.sender;
        const conversationId = [message.sender_id, message.receiver_id].sort().join('_');
        
        if (!conversationMap.has(conversationId)) {
          conversationMap.set(conversationId, {
            id: conversationId,
            otherUser: otherUser,
            lastMessage: message,
            unreadCount: message.receiver_id === userId && message.status === 'sent' ? 1 : 0,
            messages: [message]
          });
        } else {
          const conv = conversationMap.get(conversationId);
          conv.messages.push(message);
          if (message.receiver_id === userId && message.status === 'sent') {
            conv.unreadCount++;
          }
          // Keep the latest message as lastMessage
          if (new Date(message.created_at) > new Date(conv.lastMessage.created_at)) {
            conv.lastMessage = message;
          }
        }
      });

      // Convert map to array and sort by last message time
      conversationMap.forEach(conv => {
        conversations.push(conv);
      });

      conversations.sort((a, b) => 
        new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
      );

      console.log(`Found ${conversations.length} conversations`);
      return { success: true, data: conversations };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch conversations',
        data: [] 
      };
    }
  },

  // Get messages between two users
  async getMessages(userId1, userId2) {
    try {
      console.log('Fetching messages between', userId1, 'and', userId2);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(
            id, 
            first_name, 
            last_name, 
            full_name, 
            photo_url
          ),
          receiver:receiver_id(
            id, 
            first_name, 
            last_name, 
            full_name, 
            photo_url
          )
        `)
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log(`Found ${data.length} messages`);
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch messages',
        data: [] 
      };
    }
  },

  // Get message requests (unread messages where user is receiver)
  async getMessageRequests(userId) {
    try {
      console.log('Fetching message requests for user:', userId);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(
            id, 
            first_name, 
            last_name, 
            full_name, 
            photo_url, 
            university_name
          )
        `)
        .eq('receiver_id', userId)
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log(`Found ${data.length} message requests`);
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching message requests:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch message requests',
        data: [] 
      };
    }
  },

  // Accept a message request
  async acceptMessage(messageId) {
    try {
      console.log('Accepting message:', messageId);

      const { data, error } = await supabase
        .from('messages')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select(`
          *,
          sender:sender_id(
            id, 
            first_name, 
            last_name, 
            full_name, 
            photo_url
          )
        `)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Message accepted:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error accepting message:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to accept message' 
      };
    }
  },

  // Decline a message request
  async declineMessage(messageId) {
    try {
      console.log('Declining message:', messageId);

      const { data, error } = await supabase
        .from('messages')
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select(`
          *,
          sender:sender_id(
            id, 
            first_name, 
            last_name, 
            full_name, 
            photo_url
          )
        `)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Message declined:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error declining message:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to decline message' 
      };
    }
  },

  // Mark message as read
  async markAsRead(messageId) {
    try {
      console.log('Marking message as read:', messageId);

      const { error } = await supabase
        .from('messages')
        .update({ 
          status: 'read',
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Message marked as read');
      return { success: true };
    } catch (error) {
      console.error('Error marking message as read:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to mark message as read' 
      };
    }
  },

  // Get unread count for a user
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('status', 'sent');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch unread count',
        count: 0 
      };
    }
  },

  // Delete a message (optional)
  async deleteMessage(messageId, userId) {
    try {
      console.log('Deleting message:', messageId);

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', userId); // Only sender can delete

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Message deleted');
      return { success: true };
    } catch (error) {
      console.error('Error deleting message:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to delete message' 
      };
    }
  }
};