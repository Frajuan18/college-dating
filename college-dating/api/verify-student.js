// api/verify-student.js
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Set headers
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
    // Parse form data with formidable
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Extract fields (formidable returns arrays)
    const formData = {
      telegramId: fields.telegramId?.[0] || '',
      telegramUsername: fields.telegramUsername?.[0] || '',
      firstName: fields.firstName?.[0] || '',
      lastName: fields.lastName?.[0] || '',
      universityName: fields.universityName?.[0] || '',
      studentId: fields.studentId?.[0] || '',
      graduationYear: fields.graduationYear?.[0] || '',
      gender: fields.gender?.[0] || '',
    };

    console.log('✅ Extracted form data:', formData);
    
    // Get the uploaded file
    const idPhoto = files.idPhoto?.[0];
    if (!idPhoto) {
      return res.status(400).json({ 
        success: false, 
        message: 'No ID photo uploaded' 
      });
    }

    const BOT_TOKEN = '8684907265:AAGvjagNlpGA5tsJaYlW_wZBSViWs6sPzKg';
    const ADMIN_ID = '8016243457';

    // Read the file and convert to base64
    const fileBuffer = fs.readFileSync(idPhoto.filepath);
    const base64File = fileBuffer.toString('base64');

    // Create display name
    const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ') || 'Not provided';
    const displayUsername = formData.telegramUsername ? `@${formData.telegramUsername}` : 'Not provided';

    // First, send the text message with buttons
    const message = `🔔 *New Student Verification Request*

👤 *Name:* ${fullName}
📱 *Telegram:* ${displayUsername}
🆔 *Telegram ID:* \`${formData.telegramId}\`
🎓 *University:* ${formData.universityName}
🆔 *Student ID:* ${formData.studentId}
📅 *Graduation Year:* ${formData.graduationYear}
⚥ *Gender:* ${formData.gender}

Please verify this student by clicking one of the buttons below.`;

    // Create inline keyboard
    const inlineKeyboard = {
      inline_keyboard: [[
        {
          text: '✅ Verify',
          callback_data: JSON.stringify({
            action: 'verify',
            userId: formData.telegramId,
            username: formData.telegramUsername || 'Not provided',
            name: fullName
          })
        },
        {
          text: '❌ Reject',
          callback_data: JSON.stringify({
            action: 'reject',
            userId: formData.telegramId,
            username: formData.telegramUsername || 'Not provided',
            name: fullName
          })
        }
      ]]
    };

    // Send the text message first
    const textResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      })
    });

    const textResult = await textResponse.json();
    
    if (!textResult.ok) {
      throw new Error(`Failed to send message: ${textResult.description}`);
    }

    // Now send the photo as a separate message
    const photoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        photo: `data:${idPhoto.mimetype};base64,${base64File}`,
        caption: `📸 *ID Photo for:* ${fullName}\nStudent ID: ${formData.studentId}`,
        parse_mode: 'Markdown'
      })
    });

    const photoResult = await photoResponse.json();
    
    if (!photoResult.ok) {
      console.warn('Photo send failed:', photoResult.description);
    }

    // Clean up temp file
    fs.unlinkSync(idPhoto.filepath);

    // Success response
    return res.status(200).json({
      success: true,
      message: '✅ Verification request sent to admin! You will be notified once verified.',
      data: {
        university: formData.universityName,
        studentId: formData.studentId
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