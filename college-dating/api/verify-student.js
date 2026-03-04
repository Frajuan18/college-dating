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
    // Parse the multipart form data
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    const contentType = req.headers['content-type'] || '';
    const boundary = contentType.split('boundary=')[1];
    
    if (!boundary) {
      return res.status(400).json({ success: false, message: 'No boundary found' });
    }

    const parts = buffer.toString().split(`--${boundary}`);
    const formData = {};

    parts.forEach(part => {
      // Check if this part contains a name field
      const nameMatch = part.match(/name="([^"]+)"/);
      if (nameMatch) {
        const name = nameMatch[1];
        
        // Skip file parts for now (we're focusing on text data)
        if (!part.includes('filename')) {
          // Extract the value
          const valueMatch = part.split('\r\n\r\n')[1];
          if (valueMatch) {
            // Clean up the value
            let value = valueMatch.split('\r\n')[0];
            value = value.replace(/\r$/, '').trim();
            formData[name] = value;
          }
        }
      }
    });

    console.log('✅ Extracted form data:', formData);

    const BOT_TOKEN = '8684907265:AAGvjagNlpGA5tsJaYlW_wZBSViWs6sPzKg';
    const ADMIN_ID = '8016243457'; // Your numeric ID
    
    // Safely extract data with fallbacks
    const telegramId = formData.telegramId || 'Not provided';
    const telegramUsername = formData.telegramUsername || 'Not provided';
    const firstName = formData.firstName || '';
    const lastName = formData.lastName || '';
    const universityName = formData.universityName || 'Not provided';
    const studentId = formData.studentId || 'Not provided';
    const graduationYear = formData.graduationYear || 'Not provided';
    const gender = formData.gender || 'Not provided';

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

    // Format message EXACTLY like the test that worked
    const message = `🔔 *New Student Verification Request*

👤 *Name:* ${fullName}
📱 *Telegram:* @${telegramUsername}
🆔 *Telegram ID:* \`${telegramId}\`
🎓 *University:* ${universityName}
🆔 *Student ID:* ${studentId}
📅 *Graduation Year:* ${graduationYear}
⚥ *Gender:* ${gender}

Please verify this student by clicking one of the buttons below.`;

    console.log('📤 Sending to Telegram:', message);

    // Send message to admin - USING SAME FORMAT AS WORKING TEST
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
    console.log('📨 Telegram API response:', telegramResult);

    if (!telegramResult.ok) {
      return res.status(200).json({
        success: true,
        message: 'Request received but Telegram notification failed',
        error: telegramResult.description,
        data: formData
      });
    }

    // Success - everything worked
    return res.status(200).json({
      success: true,
      message: '✅ Verification request sent to admin! You will be notified once verified.',
      data: {
        university: universityName,
        studentId: studentId
      }
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
}