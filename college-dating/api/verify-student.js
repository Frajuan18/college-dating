// api/verify-student.js
export const config = {
  api: {
    bodyParser: false, // Must be false for FormData
  },
};

export default async function handler(req, res) {
  // Set JSON headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const formData = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const boundary = req.headers['content-type']?.split('boundary=')[1];
        
        if (!boundary) {
          reject(new Error('No boundary found'));
          return;
        }

        const parts = buffer.toString().split(`--${boundary}`);
        const result = {};

        parts.forEach(part => {
          const nameMatch = part.match(/name="([^"]+)"/);
          if (nameMatch) {
            const name = nameMatch[1];
            // Get the value (skip headers)
            const valueMatch = part.split('\r\n\r\n')[1];
            if (valueMatch) {
              const value = valueMatch.split('\r\n--')[0];
              result[name] = value.trim();
            }
          }
        });

        resolve(result);
      });
      req.on('error', reject);
    });

    console.log('Parsed form data:', formData);

    const BOT_TOKEN = '8684907265:AAGvjagNlpGA5tsJaYlW_wZBSViWs6sPzKg';
    const ADMIN_ID = '8016243457'; // Your numeric ID
    
    // Safely extract data with fallbacks
    const {
      telegramId = 'Not provided',
      telegramUsername = 'Not provided',
      firstName = '',
      lastName = '',
      universityName = '',
      studentId = '',
      graduationYear = '',
      gender = ''
    } = formData;

    // Create display name
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Not provided';

    // Create inline keyboard for admin actions
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
            text: '❌ Reject',
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

👤 *Name:* ${fullName}
📱 *Telegram Username:* @${telegramUsername}
🆔 *Telegram ID:* \`${telegramId}\`
🎓 *University:* ${universityName || 'Not provided'}
🆔 *Student ID:* ${studentId || 'Not provided'}
📅 *Graduation Year:* ${graduationYear || 'Not provided'}
⚥ *Gender:* ${gender || 'Not provided'}

Please verify this student by clicking one of the buttons below.
    `;

    console.log('Sending to Telegram:', message);

    // Send message to admin
    const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      })
    });

    const telegramResult = await telegramResponse.json();
    console.log('Telegram API response:', telegramResult);

    if (!telegramResult.ok) {
      return res.status(200).json({
        success: true,
        message: 'Your request was received, but admin notification failed. Please try again or contact support.',
        telegramError: telegramResult.description
      });
    }

    // Success - everything worked
    return res.status(200).json({
      success: true,
      message: '✅ Verification request sent to admin! You will be notified once verified.',
      data: {
        university: universityName,
        studentId: studentId,
        telegramNotified: true
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
}