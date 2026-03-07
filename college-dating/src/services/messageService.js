// services/messageService.js
import { supabase } from '../lib/supabaseClient';

export const messageService = {
  // Test database connection
  async testConnection() {
    try {
      console.log('🔍 Testing database connection...');
      const { error } = await supabase
        .from('messages')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Connection test failed:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Database connection successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Connection test error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send a new message
  async sendMessage(senderId, receiverId, content) {
    try {
      console.log('📨 Sending message:', { 
        senderId, 
        receiverId, 
        content: content.substring(0, 30) + '...' 
      });

      // Validate inputs
      if (!senderId || !receiverId || !content) {
        throw new Error('Missing required fields');
      }

      // Simple insert without joins
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

      if (error) {
        console.error('❌ Supabase error:', error);
        
        // Handle specific error codes
        if (error.code === '23503') {
          return { 
            success: false, 
            error: 'User not found. Please check the user IDs.' 
          };
        } else if (error.code === '42501') {
          return { 
            success: false, 
            error: 'Permission denied. Please run the SQL to disable RLS.' 
          };
        } else if (error.code === '42P01') {
          return { 
            success: false, 
            error: 'Messages table does not exist. Please create it first.' 
          };
        } else {
          return { 
            success: false, 
            error: `Database error: ${error.message}` 
          };
        }
      }

      console.log('✅ Message sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error in sendMessage:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send message'
      };
    }
  },

  // Get all conversations for a user
  async getConversations(userId) {
    try {
      console.log('💬 Fetching conversations for user:', userId);

      // Get all messages for this user
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!messages || messages.length === 0) {
        return { success: true, data: [] };
      }

      // Get all unique user IDs
      const userIds = new Set();
      messages.forEach(msg => {
        userIds.add(msg.sender_id);
        userIds.add(msg.receiver_id);
      });

      // Fetch user details
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, full_name, photo_url, university_name')
        .in('id', Array.from(userIds));

      if (usersError) throw usersError;

      // Create user map
      const userMap = {};
      users.forEach(user => {
        userMap[user.id] = user;
      });

      // Group messages by conversation
      const conversationMap = new Map();

      messages.forEach(msg => {
        const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        const otherUser = userMap[otherUserId] || { 
          id: otherUserId,
          full_name: 'Unknown User',
          photo_url: null
        };
        
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
          if (new Date(msg.created_at) > new Date(conv.lastMessage.created_at)) {
            conv.lastMessage = msg;
          }
        }
      });

      // Sort conversations by last message time
      const conversations = Array.from(conversationMap.values());
      conversations.sort((a, b) => 
        new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
      );

      return { success: true, data: conversations };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get messages between two users
  async getMessages(userId1, userId2) {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get user details
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, full_name, photo_url')
        .in('id', [userId1, userId2]);

      if (usersError) throw usersError;

      const userMap = {};
      users.forEach(user => {
        userMap[user.id] = user;
      });

      // Add user info to messages
      const messagesWithUsers = messages.map(msg => ({
        ...msg,
        sender: userMap[msg.sender_id] || null,
        receiver: userMap[msg.receiver_id] || null
      }));

      return { success: true, data: messagesWithUsers };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get message requests (unread messages)
  async getMessageRequests(userId) {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', userId)
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!messages || messages.length === 0) {
        return { success: true, data: [] };
      }

      // Get sender IDs
      const senderIds = messages.map(msg => msg.sender_id);
      
      // Fetch sender info
      const { data: senders, error: sendersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, full_name, photo_url, university_name')
        .in('id', senderIds);

      if (sendersError) throw sendersError;

      const senderMap = {};
      senders.forEach(sender => {
        senderMap[sender.id] = sender;
      });

      // Add sender info to messages
      const messagesWithSenders = messages.map(msg => ({
        ...msg,
        sender: senderMap[msg.sender_id] || {
          id: msg.sender_id,
          full_name: 'Unknown User'
        }
      }));

      return { success: true, data: messagesWithSenders };
    } catch (error) {
      console.error('Error fetching message requests:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Accept a message request
  async acceptMessage(messageId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
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
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()
        })
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

  // Get unread count
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
      console.error('Error fetching unread count:', error);
      return { success: false, error: error.message, count: 0 };
    }
  }
};