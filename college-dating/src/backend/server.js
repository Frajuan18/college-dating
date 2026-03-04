// server.js - Backend for Telegram bot verification
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

// Store verification sessions
const verificationStore = new Map();

// Telegram Bot Setup
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Handle /start command with verification ID
bot.onText(/\/start (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const verificationId = match[1];
  
  // Store chatId with verificationId
  verificationStore.set(verificationId, { chatId, step: 'started' });
  
  // Send welcome message with contact request
  bot.sendMessage(chatId, 
    'Welcome! To verify your account, please share your contact:', {
    reply_markup: {
      keyboard: [[{
        text: '📱 Share Contact',
        request_contact: true
      }]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// Handle contact sharing
bot.on('contact', (msg) => {
  const chatId = msg.chat.id;
  const contact = msg.contact;
  
  // Find verification session by chatId
  for (const [verificationId, data] of verificationStore.entries()) {
    if (data.chatId === chatId && data.step === 'started') {
      // Store user data
      data.step = 'verified';
      data.user = {
        id: contact.user_id,
        first_name: contact.first_name,
        last_name: contact.last_name,
        phone_number: contact.phone_number,
        username: msg.from.username,
        verified: true
      };
      
      // Confirm verification
      bot.sendMessage(chatId, 
        '✅ Verification successful! You can close this chat.',
        { reply_markup: { remove_keyboard: true } }
      );
      
      break;
    }
  }
});

// API endpoint to check verification status
app.get('/api/check-verification', (req, res) => {
  const { id } = req.query;
  const session = verificationStore.get(id);
  
  if (session && session.step === 'verified') {
    // Clear session after successful verification
    verificationStore.delete(id);
    res.json({ verified: true, user: session.user });
  } else {
    res.json({ verified: false });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});