// telegram-bot.js
const TelegramBot = require('node-telegram-bot-api');

// Your bot token from BotFather
const token = 'YOUR_BOT_TOKEN'; // Replace with your actual token
const bot = new TelegramBot(token, { polling: true });

// Store verification codes
const users = {};

console.log('🤖 Bot is running...');

// Welcome message with keyboard on any message
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const firstName = msg.from.first_name || 'User';
  
  console.log(`Message from ${firstName}: ${text}`);
  
  // Create keyboard with contact button
  const keyboard = {
    reply_markup: {
      keyboard: [
        [
          {
            text: '📱 Share Contact',
            request_contact: true
          }
        ]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };
  
  // Handle /start command
  if (text === '/start') {
    bot.sendMessage(
      chatId,
      `👋 Hello ${firstName}!\n\n` +
      `Welcome to College Dating Bot.\n\n` +
      `To verify your account, please click the button below:`,
      keyboard
    );
  }
  // Handle /contact command
  else if (text === '/contact') {
    bot.sendMessage(
      chatId,
      'Click the button below to share your contact:',
      keyboard
    );
  }
  // Handle any other message
  else if (text && !text.startsWith('/') && !msg.contact) {
    bot.sendMessage(
      chatId,
      'Please use the button below to share your contact:',
      keyboard
    );
  }
});

// Handle contact sharing
bot.on('contact', (msg) => {
  const chatId = msg.chat.id;
  const contact = msg.contact;
  const from = msg.from;
  
  console.log('📱 Contact received:', {
    user_id: contact.user_id,
    first_name: contact.first_name,
    phone: contact.phone_number
  });
  
  // Generate 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store user data
  users[verificationCode] = {
    chatId,
    user: {
      id: contact.user_id,
      first_name: contact.first_name,
      last_name: contact.last_name || '',
      phone_number: contact.phone_number,
      username: from.username || '',
      verified: true
    }
  };
  
  // Send success message with code
  bot.sendMessage(
    chatId,
    `✅ *Contact Verified!*\n\n` +
    `Your verification code is: *${verificationCode}*\n\n` +
    `Please enter this code in the app to continue.`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        remove_keyboard: true
      }
    }
  );
  
  // Auto-delete after 5 minutes (optional)
  setTimeout(() => {
    if (users[verificationCode]) {
      delete users[verificationCode];
      console.log(`Code ${verificationCode} expired`);
    }
  }, 5 * 60 * 1000);
});

// Handle callback queries (if any)
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  bot.sendMessage(msg.chat.id, 'Please use the contact button to verify.');
});