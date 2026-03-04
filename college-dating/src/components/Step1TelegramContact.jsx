// components/Step1TelegramContact.jsx
import React, { useState, useEffect } from 'react';

const Step1TelegramContact = ({
  formData,
  errors,
  onTelegramShare,
  onNext,
}) => {
  const [step, setStep] = useState('connect'); // connect, waiting, verified
  const [verificationId, setVerificationId] = useState(null);
  const botUsername = 'collegedatingbot';

  // Generate a unique verification ID for this session
  useEffect(() => {
    setVerificationId('verify_' + Date.now() + '_' + Math.random().toString(36).substring(7));
  }, []);

  const handleOpenTelegram = () => {
    // Open Telegram bot with a start parameter containing verification ID
    window.open(`https://t.me/${botUsername}?start=${verificationId}`, '_blank');
    setStep('waiting');
    
    // Start polling for verification
    startPolling();
  };

  const startPolling = () => {
    // Poll your backend to check if user has shared contact
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/check-verification?id=${verificationId}`);
        const data = await response.json();
        
        if (data.verified && data.user) {
          clearInterval(interval);
          setStep('verified');
          onTelegramShare(data.user);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 2 minutes
    setTimeout(() => clearInterval(interval), 120000);
  };

  const handleManualVerify = () => {
    // For demo/testing - simulate verification
    setStep('verified');
    onTelegramShare({
      id: 123456789,
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe',
      phone_number: '+1234567890',
      photo_url: 'https://via.placeholder.com/100',
      verified: true
    });
  };

  if (step === 'connect') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#0088cc] rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.892 8.915c-.14.646-.52.803-1.054.5l-2.915-2.148-1.41 1.356c-.156.156-.287.287-.588.287l.21-2.98 5.425-4.903c.236-.21-.052-.328-.366-.118l-6.71 4.225-2.887-.96c-.63-.196-.642-.63.13-.934l11.27-4.344c.525-.194.985.128.814.904z" />
              </svg>
            </div>
          </div>

          <h2 className="text-white text-2xl font-bold mb-2">
            Verify with Telegram
          </h2>
          <p className="text-white/70 mb-6">
            Click the button below to open our bot and share your contact
          </p>
          
          <div className="bg-white/10 rounded-lg p-6 mb-4 border-2 border-white/20">
            <p className="text-white font-medium mb-3">Bot: @{botUsername}</p>
            
            <button
              onClick={handleOpenTelegram}
              className="w-full bg-[#0088cc] text-white text-lg font-bold py-3 rounded-lg hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.892 8.915c-.14.646-.52.803-1.054.5l-2.915-2.148-1.41 1.356c-.156.156-.287.287-.588.287l.21-2.98 5.425-4.903c.236-.21-.052-.328-.366-.118l-6.71 4.225-2.887-.96c-.63-.196-.642-.63.13-.934l11.27-4.344c.525-.194.985.128.814.904z"/>
              </svg>
              Open Telegram Bot
            </button>
            
            <div className="mt-4 p-3 bg-blue-500/20 rounded-lg">
              <p className="text-blue-200 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                In the bot, click "Share Contact" to verify
              </p>
            </div>
          </div>
        </div>

        {/* Manual verify button for testing */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={handleManualVerify}
            className="w-full bg-white/10 border border-white/30 text-white py-2 rounded-lg text-sm"
          >
            🔧 Dev: Simulate Contact Share
          </button>
        )}
      </div>
    );
  }

  if (step === 'waiting') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[#0088cc] rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.892 8.915c-.14.646-.52.803-1.054.5l-2.915-2.148-1.41 1.356c-.156.156-.287.287-.588.287l.21-2.98 5.425-4.903c.236-.21-.052-.328-.366-.118l-6.71 4.225-2.887-.96c-.63-.196-.642-.63.13-.934l11.27-4.344c.525-.194.985.128.814.904z" />
            </svg>
          </div>
        </div>

        <h2 className="text-white text-2xl font-bold mb-2">
          Waiting for Verification
        </h2>
        <p className="text-white/70 mb-4">
          Please share your contact in the Telegram bot
        </p>
        
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 text-white/80">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            <span>Waiting for contact share...</span>
          </div>
        </div>

        <button
          onClick={() => setStep('connect')}
          className="text-white/50 hover:text-white text-sm transition"
        >
          ← Back
        </button>
      </div>
    );
  }

  // Verified step
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <h2 className="text-white text-2xl font-bold mb-2">
          Verification Successful!
        </h2>
        
        {formData.telegramData && (
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              {formData.telegramData.photo_url && (
                <img 
                  src={formData.telegramData.photo_url} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="text-left">
                <p className="text-white font-medium">
                  {formData.telegramData.first_name} {formData.telegramData.last_name}
                </p>
                <p className="text-white/60 text-sm">
                  @{formData.telegramData.username}
                </p>
                <p className="text-white/60 text-xs">
                  {formData.telegramData.phone_number}
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-white/70 mb-6">
          Your Telegram contact has been verified
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-white text-rose-600 text-lg font-bold py-3 rounded-lg hover:scale-105 transition-transform duration-200"
      >
        Continue to Next Step
      </button>
    </div>
  );
};

export default Step1TelegramContact;