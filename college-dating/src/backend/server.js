// server.js - Add this endpoint
app.post('/api/verify-telegram-code', (req, res) => {
  const { code } = req.body;
  
  // In production, you'd check this against your database
  // This is a mock implementation
  const mockVerification = {
    'abc123': {
      id: 123456789,
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe',
      phone_number: '+1234567890',
      verified: true
    }
  };

  const user = mockVerification[code];
  
  if (user) {
    res.json({ verified: true, user });
  } else {
    res.json({ verified: false });
  }
});