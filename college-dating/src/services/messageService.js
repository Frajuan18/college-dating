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
        return { 
          success: false, 
          error: 'Missing required fields' 
        };
      }

      // Insert the message
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

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      if (!messages || messages.length === 0) {
        return { success: true, data: [] };
      }

      // Get all unique user IDs from messages
      const userIds = new Set();
      messages.forEach(msg => {
        userIds.add(msg.sender_id);
        userIds.add(msg.receiver_id);
      });

      // Fetch all users involved
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, full_name, photo_url, university_name')
        .in('id', Array.from(userIds));

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      // Create a map of user data for easy lookup
      const userMap = {};
      if (users) {
        users.forEach(user => {
          userMap[user.id] = user;
        });
      }

      // Group messages by conversation
      const conversationMap = new Map();

      messages.forEach(msg => {
        const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        const otherUser = userMap[otherUserId] || { 
          id: otherUserId,
          first_name: 'Unknown',
          last_name: '',
          full_name: 'Unknown User',
          photo_url: null,
          university_name: null
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
          // Keep the latest message as lastMessage
          if (new Date(msg.created_at) > new Date(conv.lastMessage.created_at)) {
            conv.lastMessage = msg;
          }
        }
      });

      // Convert map to array and sort by last message time
      const conversations = Array.from(conversationMap.values());
      conversations.sort((a, b) => 
        new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
      );

      console.log(`✅ Found ${conversations.length} conversations`);
      return { success: true, data: conversations };
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
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
      console.log('💬 Fetching messages between', userId1, 'and', userId2);

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      // Fetch sender and receiver info
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, full_name, photo_url')
        .in('id', [userId1, userId2]);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      const userMap = {};
      if (users) {
        users.forEach(user => {
          userMap[user.id] = user;
        });
      }

      // Add user info to messages
      const messagesWithUsers = messages.map(msg => ({
        ...msg,
        sender: userMap[msg.sender_id] || null,
        receiver: userMap[msg.receiver_id] || null
      }));

      console.log(`✅ Found ${messages.length} messages`);
      return { success: true, data: messagesWithUsers };
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
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
      console.log('📬 Fetching message requests for user:', userId);

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', userId)
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching message requests:', error);
        throw error;
      }

      if (!messages || messages.length === 0) {
        return { success: true, data: [] };
      }

      // Get all sender IDs
      const senderIds = messages.map(msg => msg.sender_id);
      
      // Fetch sender info
      const { data: senders, error: sendersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, full_name, photo_url, university_name')
        .in('id', senderIds);

      if (sendersError) {
        console.error('Error fetching senders:', sendersError);
        throw sendersError;
      }

      const senderMap = {};
      if (senders) {
        senders.forEach(sender => {
          senderMap[sender.id] = sender;
        });
      }

      // Add sender info to messages
      const messagesWithSenders = messages.map(msg => ({
        ...msg,
        sender: senderMap[msg.sender_id] || {
          id: msg.sender_id,
          first_name: 'Unknown',
          last_name: '',
          full_name: 'Unknown User',
          photo_url: null,
          university_name: null
        }
      }));

      console.log(`✅ Found ${messages.length} message requests`);
      return { success: true, data: messagesWithSenders };
    } catch (error) {
      console.error('❌ Error fetching message requests:', error);
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
      console.log('✅ Accepting message:', messageId);

      const { data, error } = await supabase
        .from('messages')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select()
        .single();

      if (error) {
        console.error('Error accepting message:', error);
        throw error;
      }

      console.log('✅ Message accepted:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error accepting message:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to accept message' 
      };
    }
  },

  // Decline a message request
  async declineMessage(messageId) {
    try {
      console.log('❌ Declining message:', messageId);

      const { data, error } = await supabase
        .from('messages')
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select()
        .single();

      if (error) {
        console.error('Error declining message:', error);
        throw error;
      }

      console.log('✅ Message declined:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error declining message:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to decline message' 
      };
    }
  },

  // Mark message as read
  async markAsRead(messageId) {
    try {
      console.log('👁️ Marking message as read:', messageId);

      const { error } = await supabase
        .from('messages')
        .update({ 
          status: 'read',
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error marking message as read:', error);
        throw error;
      }

      console.log('✅ Message marked as read');
      return { success: true };
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
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
        console.error('Error fetching unread count:', error);
        throw error;
      }

      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
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
      console.log('🗑️ Deleting message:', messageId);

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', userId); // Only sender can delete

      if (error) {
        console.error('Error deleting message:', error);
        throw error;
      }

      console.log('✅ Message deleted');
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to delete message' 
      };
    }
  },

  // Get recent messages (last 30 days)
  async getRecentMessages(userId, limit = 50) {
    try {
      console.log('📨 Fetching recent messages for user:', userId);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent messages:', error);
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Error fetching recent messages:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch recent messages',
        data: [] 
      };
    }
  }
};