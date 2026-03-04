// api/verify-student.js
export const config = {
  api: {
    bodyParser: false, // Important for file uploads
  },
};

export default async function handler(req, res) {
  // Set JSON headers FIRST
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
    // Parse multipart form data manually
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Convert buffer to string and parse simple fields
    // This is a simplified version - for production use a library
    const boundary = req.headers['content-type'].split('boundary=')[1];
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
                data: fileContent
              };
            }
          } else {
            // This is a text field
            const value = part.split('\r\n\r\n')[1]?.split('\r\n--')[0];
            if (value) {
              formData[name] = value.trim();
            }
          }
        }
      }
    });

    // Now send to Telegram
    const BOT_TOKEN = '8684907265:AAGvjagNlpGA5tsJaYlW_wZBSViWs6sPzKg';
    const ADMIN_ID = '@Fra_juan';
    
    const message = `
🔔 *New Student Verification Request*

👤 *User:* ${formData.firstName || ''} ${formData.lastName || ''}
📱 *Telegram:* @${formData.telegramUsername || 'No username'}
🎓 *University:* ${formData.universityName || ''}
🆔 *Student ID:* ${formData.studentId || ''}
📅 *Graduation Year:* ${formData.graduationYear || ''}
⚥ *Gender:* ${formData.gender || ''}
    `;

    // Send to Telegram (you'll need to implement this part)
    // For now, just log it
    console.log('Sending to Telegram:', message);
    console.log('File received:', fileData?.filename);

    // ALWAYS return JSON
    return res.status(200).json({
      success: true,
      message: 'Verification request received! Please wait for admin approval.',
      data: {
        university: formData.universityName,
        studentId: formData.studentId,
        fileReceived: !!fileData
      }
    });

  } catch (error) {
    // ALWAYS return JSON, even on error
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
}