// api/telegram-webhook.js
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { callback_query } = req.body;
    
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

      // Answer callback query (removes loading state on button)
      await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: id,
          text: actionData.action === 'verify' ? '✅ User verified!' : '❌ User rejected',
          show_alert: false
        })
      });

      if (actionData.action === 'verify') {
        // Send success message to user
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: actionData.userId,
            text: `✅ *Verification Approved!*\n\nCongratulations @${actionData.username}! Your student ID has been verified. You can now access all features of College Dating app.\n\n[Open App](https://college-dating.vercel.app)`,
            parse_mode: 'Markdown'
          })
        });

        // Edit original admin message to show verified
        await fetch(`${TELEGRAM_API}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            text: msg.text + `\n\n✅ *VERIFIED by* ${from.first_name}`,
            parse_mode: 'Markdown'
          })
        });

      } else if (actionData.action === 'reject') {
        // Send rejection message to user
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: actionData.userId,
            text: `❌ *Verification Rejected*\n\nHello @${actionData.username}, your student ID verification was rejected. Please make sure your ID photo is clear and shows all required information.\n\n[Try Again](https://college-dating.vercel.app/register)`,
            parse_mode: 'Markdown'
          })
        });

        // Edit original admin message to show rejected
        await fetch(`${TELEGRAM_API}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            text: msg.text + `\n\n❌ *REJECTED by* ${from.first_name}`,
            parse_mode: 'Markdown'
          })
        });
      }
    }

    res.status(200).json({ ok: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ ok: true });
  }
}