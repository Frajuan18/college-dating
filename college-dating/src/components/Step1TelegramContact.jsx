// components/Step1TelegramContact.jsx
import React, { useState, useEffect } from 'react';

const Step1TelegramContact = ({
  formData,
  errors,
  onTelegramShare,
  onNext,
}) => {
  const [step, setStep] = useState('connect'); // connect, enter-code, verified
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  const botUsername = 'collegedatingbot';
  const botAppUrl = `https://t.me/${botUsername}/app`; // Use /app for Telegram WebApp

  // Detect if user is on mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    };
    setIsMobile(checkMobile());
  }, []);

  const handleTelegramConnect = () => {
    if (isMobile) {
      // On mobile, try to open Telegram app directly
      window.location.href = `tg://resolve?domain=${botUsername}&appname=app`;
      
      // Fallback to web version if app doesn't open
      setTimeout(() => {
        window.open(botAppUrl, '_blank');
      }, 500);
    } else {
      // On desktop, open Telegram Web
      window.open(botAppUrl, '_blank');
    }
    
    setStep('enter-code');
  };

  const handleOpenTelegram = () => {
    window.open(`https://t.me/${botUsername}`, '_blank');
    setStep('enter-code');
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setVerificationError('Please enter a valid verification code');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    try {
      // Call your backend to verify the code
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
        setVerificationError('Invalid verification code. Please try again.');
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
            Connect with Telegram
          </h2>
          <p className="text-white/70 mb-4">
            Step 1: Connect your Telegram account to continue
          </p>
          
          <div className="bg-white/10 rounded-lg p-6 mb-4 border-2 border-white/20">
            <p className="text-white font-medium mb-3">Bot: @{botUsername}</p>
            
            {/* Main Connect Button - Works on both mobile and PC */}
            <button
              onClick={handleTelegramConnect}
              className="w-full bg-[#0088cc] text-white text-lg font-bold py-4 rounded-lg hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-3 mb-3 shadow-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.892 8.915c-.14.646-.52.803-1.054.5l-2.915-2.148-1.41 1.356c-.156.156-.287.287-.588.287l.21-2.98 5.425-4.903c.236-.21-.052-.328-.366-.118l-6.71 4.225-2.887-.96c-.63-.196-.642-.63.13-.934l11.27-4.344c.525-.194.985.128.814.904z"/>
              </svg>
              Continue with Telegram
            </button>

            {/* Alternative option for manual opening */}
            <button
              onClick={handleOpenTelegram}
              className="w-full bg-white/10 text-white text-sm py-2 rounded-lg hover:bg-white/20 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open Telegram Manually
            </button>
            
            <div className="mt-4 p-4 bg-blue-500/20 rounded-lg">
              <p className="text-blue-200 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  <strong>How to connect:</strong><br/>
                  1. Click "Continue with Telegram" above<br/>
                  2. Open the bot and click "Start"<br/>
                  3. Share your phone number when prompted<br/>
                  4. Enter the verification code you receive
                </span>
              </p>
            </div>

            {/* Mobile-specific instruction */}
            {isMobile && (
              <div className="mt-3 p-2 bg-green-500/20 rounded-lg">
                <p className="text-green-200 text-xs flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <span>💡 Tip: Using Telegram app? The button will open the bot directly!</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'enter-code') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#0088cc] rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <h2 className="text-white text-2xl font-bold mb-2">
            Enter Verification Code
          </h2>
          <p className="text-white/70 mb-6">
            Enter the 6-digit code you received from the bot
          </p>

          <div className="bg-white/10 rounded-lg p-6 mb-4">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
              maxLength="6"
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 text-white text-center text-2xl tracking-widest rounded-lg focus:outline-none focus:border-pink-200 mb-4"
              autoFocus
            />

            {verificationError && (
              <p className="text-pink-200 text-sm mb-4">{verificationError}</p>
            )}

            <button
              onClick={handleVerifyCode}
              disabled={isVerifying}
              className="w-full bg-white text-rose-600 text-lg font-bold py-3 rounded-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              onClick={() => {
                setStep('connect');
                setVerificationCode('');
                setVerificationError('');
              }}
              className="w-full text-white/50 hover:text-white text-sm mt-3 transition"
            >
              ← Back
            </button>

            {/* Resend code option */}
            <button
              onClick={handleTelegramConnect}
              className="w-full text-blue-300 hover:text-blue-200 text-xs mt-2 transition"
            >
              Didn't get a code? Open bot again
            </button>
          </div>

          <p className="text-white/50 text-xs">
            Make sure you shared your phone number with the bot to receive the code
          </p>
        </div>
      </div>
    );
  }

  // Verified step
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <h2 className="text-white text-2xl font-bold mb-2">
          Connected Successfully!
        </h2>
        
        {formData.telegramData && (
          <div className="bg-white/10 rounded-lg p-4 mb-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {formData.telegramData.photo_url ? (
                <img 
                  src={formData.telegramData.photo_url} 
                  alt="Profile" 
                  className="w-14 h-14 rounded-full border-2 border-green-400"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {formData.telegramData.first_name?.charAt(0)}
                  {formData.telegramData.last_name?.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <p className="text-white font-medium text-lg">
                  {formData.telegramData.first_name} {formData.telegramData.last_name}
                </p>
                {formData.telegramData.username && (
                  <p className="text-white/60 text-sm">
                    @{formData.telegramData.username}
                  </p>
                )}
                <p className="text-white/60 text-xs">
                  ✓ Phone verified
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-white/70 mb-6">
          Your Telegram account has been successfully connected
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg font-bold py-4 rounded-lg hover:scale-105 transition-transform duration-200 shadow-lg"
      >
        Continue to Next Step →
      </button>
    </div>
  );
};

export default Step1TelegramContact;