// api/verify-student.js
import multer from 'multer';
import { createReadStream } from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Disable Next.js bodyParser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Helper function to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('idPhoto'));

    // Get form fields from req.body (multer parses them)
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

    // Validate required fields
    if (!universityName || !studentId || !graduationYear) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const ADMIN_ID = '@Fra_juan'; // Your Telegram username
    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

    // Create inline keyboard for admin
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: '✅ Verify',
            callback_data: JSON.stringify({
              action: 'verify',
              userId: telegramId,
              username: telegramUsername || 'No username'
            })
          },
          {
            text: '❌ Not Verify',
            callback_data: JSON.stringify({
              action: 'reject',
              userId: telegramId,
              username: telegramUsername || 'No username'
            })
          }
        ]
      ]
    };

    const message = `
🔔 *New Student Verification Request*

👤 *User:* ${firstName || ''} ${lastName || ''}
📱 *Telegram:* @${telegramUsername || 'No username'}
🆔 *Telegram ID:* ${telegramId || 'N/A'}
🎓 *University:* ${universityName}
🆔 *Student ID:* ${studentId}
📅 *Graduation Year:* ${graduationYear}
⚥ *Gender:* ${gender || 'Not specified'}

Please review the attached ID photo.
    `;

    let telegramResponse;

    // If there's a file, send it as photo
    if (req.file) {
      const formData = new FormData();
      formData.append('chat_id', ADMIN_ID);
      formData.append('photo', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
      formData.append('caption', message);
      formData.append('parse_mode', 'Markdown');
      formData.append('reply_markup', JSON.stringify(inlineKeyboard));

      telegramResponse = await fetch(`${TELEGRAM_API}/sendPhoto`, {
        method: 'POST',
        body: formData
      });
    } else {
      // If no file, just send text
      telegramResponse = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_ID,
          text: message + '\n\n⚠️ *No ID photo provided!*',
          parse_mode: 'Markdown',
          reply_markup: inlineKeyboard
        })
      });
    }

    const telegramResult = await telegramResponse.json();

    if (!telegramResult.ok) {
      console.error('Telegram API error:', telegramResult);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send verification request to admin' 
      });
    }

    // Here you would also save to database
    // await saveToDatabase({ ... });

    res.status(200).json({ 
      success: true, 
      message: 'Verification request sent to admin. You will be notified once verified.' 
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to process verification request' 
    });
  }
}