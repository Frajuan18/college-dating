// components/Step1TelegramContact.jsx
import React, { useState } from 'react';

const Step1TelegramContact = ({
  formData,
  errors,
  onTelegramShare,
  onNext,
}) => {
  const [step, setStep] = useState('connect'); // connect or verified
  const botUsername = 'collegedatingbot';

  const handleOpenTelegram = () => {
    // Open Telegram bot
    window.open(`https://t.me/${botUsername}`, '_blank');
    
    // For testing/demo - simulate verification
    // In production, you'd need a webhook from your bot
    setTimeout(() => {
      setStep('verified');
      onTelegramShare({
        id: 'telegram_' + Date.now(),
        first_name: 'Telegram',
        last_name: 'User',
        username: 'telegram_user',
        verified: true
      });
    }, 3000);
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
            Connect with Telegram
          </h2>
          <p className="text-white/70 mb-4">
            Step 1: Open our Telegram bot and send any message
          </p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <p className="text-white font-medium mb-2">Bot: @{botUsername}</p>
            <button
              onClick={handleOpenTelegram}
              className="bg-[#0088cc] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0077b5] transition-colors"
            >
              Open Telegram Bot
            </button>
          </div>

          <p className="text-white/50 text-sm">
            After sending a message, click the button below
          </p>
        </div>

        <button
          onClick={() => setStep('verified')}
          className="w-full bg-white text-rose-600 text-lg font-bold py-3 rounded-lg hover:scale-105 transition-transform duration-200"
        >
          I've Sent a Message
        </button>

        <p className="text-white/50 text-xs text-center">
          This verifies you're a real Telegram user
        </p>
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
          Telegram Verified!
        </h2>
        <p className="text-white/70 mb-6">
          Your Telegram account has been successfully connected
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