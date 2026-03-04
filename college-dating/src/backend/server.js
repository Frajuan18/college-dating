// server.js - Add this endpoint
app.post('/api/verify-telegram-code', (req, res) => {
  const { code } = req.body;
  
  console.log('Verifying code:', code);
  
  // Check if code exists
  if (users[code]) {
    const userData = users[code];
    
    // Return user data
    res.json({
      verified: true,
      user: userData.user
    });
    
    // Optional: Delete after successful verification
    delete users[code];
    
  } else {
    res.json({
      verified: false,
      error: 'Invalid or expired code'
    });
  }
});

// Optional: Check if code is valid without consuming
app.get('/api/check-code/:code', (req, res) => {
  const { code } = req.params;
  
  res.json({
    valid: !!users[code]
  });
});