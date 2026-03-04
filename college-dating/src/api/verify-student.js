// api/verify-student.js
export const config = {
  api: {
    bodyParser: false, // Disable bodyParser for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // You'll need to parse multipart form data
  // For simplicity, I'll show a basic version
  // Consider using multer or similar for production
  
  try {
    const { 
      telegramId, 
      telegramUsername, 
      firstName, 
      lastName,
      universityName, 
      studentId, 
      graduationYear,
      gender 
    } = req.body;

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const ADMIN_ID = '@Fra_juan'; // Your Telegram username
    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

    // Create inline keyboard
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: '✅ Verify',
            callback_data: JSON.stringify({
              action: 'verify',
              userId: telegramId,
              username: telegramUsername
            })
          },
          {
            text: '❌ Not Verify',
            callback_data: JSON.stringify({
              action: 'reject',
              userId: telegramId,
              username: telegramUsername
            })
          }
        ]
      ]
    };

    const message = `
🔔 *New Student Verification Request*

👤 *User:* ${firstName} ${lastName}
📱 *Telegram:* @${telegramUsername}
🎓 *University:* ${universityName}
🆔 *Student ID:* ${studentId}
📅 *Graduation Year:* ${graduationYear}
⚥ *Gender:* ${gender}

Please review the attached ID photo.
    `;

    // Send message to admin
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      })
    });

    res.status(200).json({ 
      success: true, 
      message: 'Verification request sent to admin. Please wait for verification.' 
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send verification request' 
    });
  }
}