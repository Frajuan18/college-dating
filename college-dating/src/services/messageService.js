// services/messageService.js
import { supabase } from '../lib/supabaseClient';

export const messageService = {
  // Send a new message
  async sendMessage(senderId, receiverId, content) {
    try {
      console.log('📨 Sending message:', { senderId, receiverId, content });

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
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        return { 
          success: false, 
          error: error.message 
        };
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
      console.log('🔍 Fetching conversations for user:', userId);

      // Get all messages where user is sender OR receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching messages:', error);
        throw error;
      }

      console.log(`📨 Found ${messages?.length || 0} total messages`);

      if (!messages || messages.length === 0) {
        return { success: true, data: [] };
      }

      // Get all unique user IDs from messages (excluding current user)
      const otherUserIds = new Set();
      messages.forEach(msg => {
        if (msg.sender_id !== userId) otherUserIds.add(msg.sender_id);
        if (msg.receiver_id !== userId) otherUserIds.add(msg.receiver_id);
      });

      console.log('👥 Other user IDs:', Array.from(otherUserIds));

      // Fetch all other users' details
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, full_name, photo_url, university_name')
        .in('id', Array.from(otherUserIds));

      if (usersError) {
        console.error('❌ Error fetching users:', usersError);
        throw usersError;
      }

      // Create a map of user data
      const userMap = {};
      if (users) {
        users.forEach(user => {
          userMap[user.id] = user;
        });
      }

      // Group messages by the other user
      const conversationMap = new Map();

      messages.forEach(msg => {
        // Determine the other user in this conversation
        const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            otherUserId: otherUserId,
            otherUser: userMap[otherUserId] || {
              id: otherUserId,
              first_name: 'Unknown',
              last_name: '',
              full_name: 'Unknown User',
              photo_url: null,
              university_name: null
            },
            messages: [],
            lastMessage: null,
            unreadCount: 0
          });
        }

        const conversation = conversationMap.get(otherUserId);
        conversation.messages.push(msg);

        // Count unread messages (received and not read)
        if (msg.receiver_id === userId && !msg.read) {
          conversation.unreadCount++;
        }

        // Track the latest message
        if (!conversation.lastMessage || 
            new Date(msg.created_at) > new Date(conversation.lastMessage.created_at)) {
          conversation.lastMessage = msg;
        }
      });

      // Convert map to array and sort by last message time
      const conversations = Array.from(conversationMap.values());
      conversations.sort((a, b) => 
        new Date(b.lastMessage?.created_at || 0) - new Date(a.lastMessage?.created_at || 0)
      );

      console.log(`✅ Found ${conversations.length} conversations`);
      return { success: true, data: conversations };
    } catch (error) {
      console.error('❌ Error in getConversations:', error);
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
      console.log('🔍 Fetching messages between', userId1, 'and', userId2);

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching messages:', error);
        throw error;
      }

      console.log(`✅ Found ${messages?.length || 0} messages`);
      return { success: true, data: messages || [] };
    } catch (error) {
      console.error('❌ Error in getMessages:', error);
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
      console.log('🔍 Fetching message requests for user:', userId);

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', userId)
        .is('read', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching message requests:', error);
        throw error;
      }

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

      if (sendersError) {
        console.error('❌ Error fetching senders:', sendersError);
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
      console.error('❌ Error in getMessageRequests:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch message requests',
        data: [] 
      };
    }
  },

  // Mark message as read
  async markAsRead(messageId) {
    try {
      console.log('👁️ Marking message as read:', messageId);

      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) {
        console.error('❌ Error marking message as read:', error);
        throw error;
      }

      console.log('✅ Message marked as read');
      return { success: true };
    } catch (error) {
      console.error('❌ Error in markAsRead:', error);
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
        .is('read', null);

      if (error) {
        console.error('❌ Error fetching unread count:', error);
        throw error;
      }

      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('❌ Error in getUnreadCount:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch unread count',
        count: 0 
      };
    }
  }
};