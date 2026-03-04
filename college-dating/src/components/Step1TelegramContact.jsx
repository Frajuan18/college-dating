// components/Step1TelegramContact.jsx
import React, { useState } from 'react';

const Step1TelegramContact = ({
  formData,
  errors,
  onTelegramShare,
  onNext,
}) => {
  const [step, setStep] = useState('connect');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  
  const botUsername = 'collegedatingbot';

  const handleOpenTelegram = () => {
    window.open(`https://t.me/${botUsername}`, '_blank');
    setStep('enter-code');
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError('Please enter the 6-digit code');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    try {
      const response = await fetch('/api/verify-telegram-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      });

      const data = await response.json();

      if (data.verified && data.user) {
        setStep('verified');
        onTelegramShare(data.user);
      } else {
        setVerificationError('Invalid code. Please try again.');
      }
    } catch (error) {
      setVerificationError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (step === 'connect') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#0088cc] rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.892 8.915c-.14.646-.52.803-1.054.5l-2.915-2.148-1.41 1.356c-.156.156-.287.287-.588.287l.21-2.98 5.425-4.903c.236-.21-.052-.328-.366-.118l-6.71 4.225-2.887-.96c-.63-.196-.642-.63.13-.934l11.27-4.344c.525-.194.985.128.814.904z" />
              </svg>
            </div>
          </div>

          <h2 className="text-white text-2xl font-bold mb-2">
            Verify with Telegram
          </h2>
          <p className="text-white/70 mb-4">
            Step 1: Open our bot and click "Share Contact"
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
            
            <div className="mt-4 p-4 bg-blue-500/20 rounded-lg">
              <p className="text-blue-200 text-sm">
                1. Click "Share Contact" in the bot<br/>
                2. Get a 6-digit verification code<br/>
                3. Enter the code below
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'enter-code') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-2">
            Enter 6-Digit Code
          </h2>
          <p className="text-white/70 mb-6">
            Enter the code you received from the bot
          </p>

          <div className="bg-white/10 rounded-lg p-6">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 text-white text-center text-2xl tracking-wider rounded-lg focus:outline-none focus:border-pink-200 mb-4"
            />

            {verificationError && (
              <p className="text-pink-200 text-sm mb-4">{verificationError}</p>
            )}

            <button
              onClick={handleVerifyCode}
              disabled={isVerifying || verificationCode.length !== 6}
              className="w-full bg-white text-rose-600 text-lg font-bold py-3 rounded-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              onClick={() => setStep('connect')}
              className="w-full text-white/50 hover:text-white text-sm mt-3"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        <h2 className="text-white text-2xl font-bold mb-4">
          Verification Successful!
        </h2>
        
        <button
          onClick={onNext}
          className="w-full bg-white text-rose-600 text-lg font-bold py-3 rounded-lg hover:scale-105 transition-transform duration-200"
        >
          Continue to Next Step
        </button>
      </div>
    </div>
  );
};

export default Step1TelegramContact;