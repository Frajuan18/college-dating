// api/telegram-webhook.js
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { callback_query, message } = req.body;
    
    // Handle callback queries (button clicks)
    if (callback_query) {
      const { data, from, id, message: msg } = callback_query;
      
      // Parse the callback data
      let actionData;
      try {
        actionData = JSON.parse(data);
      } catch (e) {
        actionData = { action: 'unknown' };
      }

      const BOT_TOKEN = '8684907265:AAGvjagNlpGA5tsJaYlW_wZBSViWs6sPzKg';
      const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

      // Answer callback query (removes loading state)
      await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: id,
          text: actionData.action === 'verify' ? '✅ User verified!' : '❌ User rejected',
          show_alert: false
        })
      });

      // Create display name for user
      const userDisplay = actionData.username && actionData.username !== 'Not provided' 
        ? `@${actionData.username}` 
        : `${actionData.name || `User ID: ${actionData.userId}`}`;

      if (actionData.action === 'verify') {
        // Send success message to user
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: actionData.userId,
            text: `✅ *Verification Approved!*\n\nCongratulations ${userDisplay}! Your student ID has been verified. You can now access all features of College Dating app.\n\n[Open App](https://college-dating.vercel.app)`,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
          })
        });

        // Here you would update your database to mark user as verified
        // await updateUserVerificationStatus(actionData.userId, true);

        // Edit original admin message
        await fetch(`${TELEGRAM_API}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            text: msg.text + `\n\n✅ *VERIFIED by* ${from.first_name} ${from.last_name || ''} (${from.username ? '@' + from.username : from.id})`,
            parse_mode: 'Markdown'
          })
        });

        // Remove the inline keyboard
        await fetch(`${TELEGRAM_API}/editMessageReplyMarkup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            reply_markup: { inline_keyboard: [] }
          })
        });

      } else if (actionData.action === 'reject') {
        // Send rejection message to user
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: actionData.userId,
            text: `❌ *Verification Rejected*\n\nHello ${userDisplay}, your student ID verification was rejected. Please make sure your ID photo is clear and shows all required information.\n\n[Try Again](https://college-dating.vercel.app/register)`,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
          })
        });

        // Edit original admin message
        await fetch(`${TELEGRAM_API}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            text: msg.text + `\n\n❌ *REJECTED by* ${from.first_name} ${from.last_name || ''} (${from.username ? '@' + from.username : from.id})`,
            parse_mode: 'Markdown'
          })
        });

        // Remove the inline keyboard
        await fetch(`${TELEGRAM_API}/editMessageReplyMarkup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            reply_markup: { inline_keyboard: [] }
          })
        });
      }
    }

    res.status(200).json({ ok: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ ok: true }); // Always return 200 to Telegram
  }
}