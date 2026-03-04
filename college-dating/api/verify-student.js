// api/verify-student.js
export const config = {
  api: {
    bodyParser: false,
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
    // Parse multipart form data
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      return res.status(400).json({ success: false, message: 'Invalid content type' });
    }
    
    const parts = buffer.toString().split(`--${boundary}`);
    
    // Extract form fields
    const formData = {};
    let fileData = null;
    
    parts.forEach(part => {
      if (part.includes('Content-Disposition')) {
        const nameMatch = part.match(/name="([^"]+)"/);
        if (nameMatch) {
          const name = nameMatch[1];
          if (part.includes('filename')) {
            // This is a file
            const filenameMatch = part.match(/filename="([^"]+)"/);
            const contentTypeMatch = part.match(/Content-Type: ([^\r\n]+)/);
            
            const fileContent = part.split('\r\n\r\n')[1]?.split('\r\n--')[0];
            if (fileContent) {
              fileData = {
                filename: filenameMatch ? filenameMatch[1] : 'unknown',
                contentType: contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream',
                data: Buffer.from(fileContent, 'binary')
              };
            }
          } else {
            // This is a text field
            const value = part.split('\r\n\r\n')[1]?.split('\r\n')[0];
            if (value) {
              formData[name] = value.replace(/\r$/, '').trim();
            }
          }
        }
      }
    });

    console.log('Form data received:', formData);
    console.log('File received:', fileData?.filename);

    // Send to Telegram
    const BOT_TOKEN = '8684907265:AAGvjagNlpGA5tsJaYlW_wZBSViWs6sPzKg';
    const ADMIN_ID = '@Fra_juan'; // or use numeric ID: '123456789'
    
    // Create inline keyboard for admin
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: '✅ Verify',
            callback_data: JSON.stringify({
              action: 'verify',
              userId: formData.telegramId || 'unknown',
              username: formData.telegramUsername || 'unknown'
            })
          },
          {
            text: '❌ Reject',
            callback_data: JSON.stringify({
              action: 'reject',
              userId: formData.telegramId || 'unknown',
              username: formData.telegramUsername || 'unknown'
            })
          }
        ]
      ]
    };

    const message = `
🔔 *New Student Verification Request*

👤 *Name:* ${formData.firstName || ''} ${formData.lastName || ''}
📱 *Telegram:* @${formData.telegramUsername || 'No username'}
🆔 *Telegram ID:* ${formData.telegramId || 'N/A'}
🎓 *University:* ${formData.universityName || ''}
🆔 *Student ID:* ${formData.studentId || ''}
📅 *Graduation Year:* ${formData.graduationYear || ''}
⚥ *Gender:* ${formData.gender || ''}

Please verify this student.
    `;

    let telegramResponse;

    if (fileData) {
      // Send photo to Telegram
      const formDataTelegram = new FormData();
      formDataTelegram.append('chat_id', ADMIN_ID);
      
      // Create a Blob from the file data
      const blob = new Blob([fileData.data], { type: fileData.contentType });
      formDataTelegram.append('photo', blob, fileData.filename);
      
      formDataTelegram.append('caption', message);
      formDataTelegram.append('parse_mode', 'Markdown');
      formDataTelegram.append('reply_markup', JSON.stringify(inlineKeyboard));

      telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formDataTelegram
      });
    } else {
      // Send text message only
      telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_ID,
          text: message + '\n\n⚠️ *No photo provided!*',
          parse_mode: 'Markdown',
          reply_markup: inlineKeyboard
        })
      });
    }

    const telegramResult = await telegramResponse.json();
    console.log('Telegram API response:', telegramResult);

    if (!telegramResult.ok) {
      console.error('Telegram error:', telegramResult);
      // Still return success to user even if Telegram fails
      // But log it so we know
    }

    // Return success to user
    return res.status(200).json({
      success: true,
      message: 'Verification request submitted successfully! Please wait for admin approval.',
      data: {
        university: formData.universityName,
        studentId: formData.studentId,
        fileReceived: !!fileData,
        telegramSent: telegramResult?.ok || false
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