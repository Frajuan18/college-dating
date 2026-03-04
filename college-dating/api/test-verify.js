// api/test-verify.js
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  const BOT_TOKEN = '8684907265:AAGvjagNlpGA5tsJaYlW_wZBSViWs6sPzKg';
  const ADMIN_ID = '8016243457';

  const testMessage = `🔔 *TEST Verification Request*

👤 *Name:* Test User
📱 *Telegram:* @testuser
🎓 *University:* Test University
🆔 *Student ID:* TEST123

This is a test message with buttons!`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '✅ Verify', callback_data: 'test_verify' },
        { text: '❌ Reject', callback_data: 'test_reject' }
      ]
    ]
  };

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: ADMIN_ID,
      text: testMessage,
      parse_mode: 'Markdown',
      reply_markup: inlineKeyboard
    })
  });

  const result = await response.json();
  
  res.status(200).json(result);
}