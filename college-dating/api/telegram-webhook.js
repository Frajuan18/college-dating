// api/telegram-webhook.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { callback_query } = req.body;
    
    if (callback_query) {
      const { data, from, id: callbackId } = callback_query;
      
      let actionData;
      try {
        actionData = JSON.parse(data);
      } catch (e) {
        actionData = { action: 'unknown' };
      }
      
      const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

      if (actionData.action === 'verify') {
        // Notify user they're verified
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: actionData.userId,
            text: `✅ *Verification Approved!*\n\nCongratulations @${actionData.username}! Your student ID has been verified. You can now access all features of College Dating app.\n\n[Open App](https://college-dating.vercel.app)`,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
          })
        });

        // Answer callback query
        await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackId,
            text: 'User verified successfully! ✅',
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
            text: `❌ *Verification Rejected*\n\nHello @${actionData.username}, your student ID verification was rejected.\n\n*Possible reasons:*\n• ID photo is blurry or unclear\n• ID doesn't show all required information\n• ID doesn't match your profile\n\nPlease try again with a clearer photo.`,
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

        // Answer callback query
        await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackId,
            text: 'User notified of rejection ❌',
            show_alert: false
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