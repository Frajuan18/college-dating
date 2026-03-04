// api/telegram-webhook.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { callback_query } = req.body;
  
  if (callback_query) {
    const { data, from } = callback_query;
    
    try {
      const actionData = JSON.parse(data);
      const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

      if (actionData.action === 'verify') {
        // Notify user they're verified
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: actionData.userId,
            text: `✅ Congratulations @${actionData.username}! Your student ID has been verified. You can now access all features!`,
            parse_mode: 'Markdown'
          })
        });

        // Answer the callback
        await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callback_query.id,
            text: 'User verified! ✅',
            show_alert: false
          })
        });

      } else if (actionData.action === 'reject') {
        // Notify user they need to resubmit
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: actionData.userId,
            text: `❌ Hello @${actionData.username}, your student ID verification was rejected. Please make sure your ID photo is clear and shows all information, then try again.`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '📤 Resubmit ID',
                    url: 'https://college-dating.vercel.app/register'
                  }
                ]
              ]
            }
          })
        });

        await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callback_query.id,
            text: 'User notified ❌',
            show_alert: false
          })
        });
      }

    } catch (error) {
      console.error('Webhook error:', error);
    }
  }

  res.status(200).json({ ok: true });
}