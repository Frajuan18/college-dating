// telegram-bot.js - Bot setup with contact sharing
const TelegramBot = require('node-telegram-bot-api');

// Replace with your bot token from @BotFather
const token = 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

// Store pending verifications
const pendingVerifications = new Map();

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  // Send message with custom keyboard that has Share Contact button
  bot.sendMessage(chatId, 
    'Welcome! To verify your account, please share your contact:', {
    reply_markup: {
      keyboard: [
        [{
          text: '📱 Share Contact',
          request_contact: true  // This creates the share contact button
        }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// Handle contact sharing
bot.on('contact', (msg) => {
  const chatId = msg.chat.id;
  const contact = msg.contact;
  
  // Generate a unique verification code
  const verificationCode = Math.random().toString(36).substring(7);
  
  // Store user data with verification code
  pendingVerifications.set(verificationCode, {
    chatId,
    user: {
      id: contact.user_id,
      first_name: contact.first_name,
      last_name: contact.last_name || '',
      phone_number: contact.phone_number,
      username: msg.from.username || '',
      verified: true,
      verified_at: new Date().toISOString()
    }
  });
  
  // Send verification code to user
  bot.sendMessage(chatId, 
    `✅ Contact received! Your verification code is: *${verificationCode}*\n\nEnter this code in the app to complete verification.`, {
    parse_mode: 'Markdown',
    reply_markup: {
      remove_keyboard: true
    }
  });
  
  console.log(`User ${contact.first_name} verified with code: ${verificationCode}`);
});

// Handle verification code check (optional)
bot.onText(/\/verify (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const code = match[1];
  
  const verification = pendingVerifications.get(code);
  if (verification && verification.chatId === chatId) {
    bot.sendMessage(chatId, '✅ Verification complete! You can close this chat.');
  } else {
    bot.sendMessage(chatId, '❌ Invalid verification code.');
  }
});

console.log('Telegram bot is running...');