// telegram-bot.js
const TelegramBot = require('node-telegram-bot-api');

const token = 'YOUR_BOT_TOKEN'; // Get from BotFather
const bot = new TelegramBot(token, { polling: true });

// Store verification codes
const verificationCodes = new Map();

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'User';
  
  // Send welcome message with contact request
  bot.sendMessage(chatId, 
    `👋 Hello ${firstName}!\n\n` +
    `To verify your account for College Dating app, please share your contact:`, {
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
  
  // Generate a simple 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store user data
  verificationCodes.set(verificationCode, {
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
  
  // Remove the keyboard
  bot.sendMessage(chatId, 
    `✅ Contact received successfully!\n\n` +
    `Your verification code is: *${verificationCode}*\n\n` +
    `Please enter this code in the app to continue.`, {
    parse_mode: 'Markdown',
    reply_markup: {
      remove_keyboard: true
    }
  });
  
  console.log(`User ${contact.first_name} verified. Code: ${verificationCode}`);
});

// Handle /code command to resend code
bot.onText(/\/code/, (msg) => {
  const chatId = msg.chat.id;
  
  // Find code for this chat
  let userCode = null;
  for (const [code, data] of verificationCodes.entries()) {
    if (data.chatId === chatId) {
      userCode = code;
      break;
    }
  }
  
  if (userCode) {
    bot.sendMessage(chatId, `Your verification code is: *${userCode}*`, {
      parse_mode: 'Markdown'
    });
  } else {
    bot.sendMessage(chatId, 'No verification found. Please /start again.');
  }
});

// Handle any other messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  
  // Ignore if it's a command or contact
  if (msg.text && !msg.text.startsWith('/') && !msg.contact) {
    bot.sendMessage(chatId, 
      'Please use the "Share Contact" button to verify.',
      {
        reply_markup: {
          keyboard: [[{
            text: '📱 Share Contact',
            request_contact: true
          }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      }
    );
  }
});

console.log('🤖 Telegram bot is running...');