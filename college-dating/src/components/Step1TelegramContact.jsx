// components/Step1TelegramContact.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Step1TelegramContact = ({
  formData,
  errors,
  onTelegramShare,
  onNext,
}) => {
  const telegramContainerRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Detect if user is on mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    };
    setIsMobile(checkMobile());
  }, []);

  useEffect(() => {
    // Check URL for Telegram callback data (for desktop redirect method)
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('id')) {
      const tgData = {
        id: urlParams.get('id'),
        first_name: urlParams.get('first_name'),
        last_name: urlParams.get('last_name') || '',
        username: urlParams.get('username') || '',
        photo_url: urlParams.get('photo_url') || '',
        auth_date: urlParams.get('auth_date'),
        hash: urlParams.get('hash')
      };
      
      console.log('Telegram user data received:', tgData);
      onTelegramShare(tgData);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onTelegramShare, navigate]);

  // For mobile - use Telegram's OAuth
  const handleMobileLogin = () => {
    const botUsername = 'collegedatingbot';
    const redirectUrl = 'https://college-dating.vercel.app/register';
    
    // Correct Telegram OAuth URL format
    const telegramLoginUrl = `https://oauth.telegram.org/auth?bot_id=${botUsername}&origin=${encodeURIComponent(window.location.origin)}&return_to=${encodeURIComponent(redirectUrl)}&embed=1`;
    
    // Open in a new window for better mobile experience
    window.open(telegramLoginUrl, '_blank', 'width=400,height=600');
  };

  // Alternative simpler mobile approach - use tg:// protocol
  const handleMobileDeepLink = () => {
    const botUsername = 'collegedatingbot';
    const startParam = 'login';
    
    // Try to open Telegram app directly
    window.location.href = `tg://resolve?domain=${botUsername}&start=${startParam}`;
    
    // Fallback to web if app not installed
    setTimeout(() => {
      window.location.href = `https://t.me/${botUsername}?start=${startParam}`;
    }, 500);
  };

  // For desktop - use widget
  useEffect(() => {
    if (!isMobile && telegramContainerRef.current) {
      telegramContainerRef.current.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?23';
      script.setAttribute('data-telegram-login', 'collegedatingbot');
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-auth-url', 'https://college-dating.vercel.app/register');
      script.setAttribute('data-request-access', 'read'); // Change to read instead of write
      script.async = true;
      
      script.onload = () => {
        console.log('Telegram widget loaded');
        setScriptLoaded(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load Telegram widget');
        setScriptError(true);
      };
      
      telegramContainerRef.current.appendChild(script);
    }
  }, [isMobile]);

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
        <p className="text-white/70 mb-6">
          {isMobile 
            ? "Open Telegram to login" 
            : "Click the button below to login with Telegram"}
        </p>
      </div>

      {scriptError && !isMobile && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-200 text-sm text-center">
            Failed to load Telegram login. Please refresh.
          </p>
        </div>
      )}

      {/* Desktop: Telegram Widget */}
      {!isMobile && (
        <div 
          ref={telegramContainerRef}
          className="flex justify-center min-h-[60px]"
        />
      )}

      {/* Mobile: Two Options */}
      {isMobile && (
        <div className="space-y-3">
          <button
            onClick={handleMobileDeepLink}
            className="w-full bg-[#0088cc] text-white text-lg font-bold py-3 rounded-lg hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.892 8.915c-.14.646-.52.803-1.054.5l-2.915-2.148-1.41 1.356c-.156.156-.287.287-.588.287l.21-2.98 5.425-4.903c.236-.21-.052-.328-.366-.118l-6.71 4.225-2.887-.96c-.63-.196-.642-.63.13-.934l11.27-4.344c.525-.194.985.128.814.904z"/>
            </svg>
            Open in Telegram App
          </button>
          
          <button
            onClick={handleMobileLogin}
            className="w-full bg-white/10 border-2 border-white/30 text-white text-lg font-bold py-3 rounded-lg hover:bg-white/20 transition-all duration-200"
          >
            Continue in Browser
          </button>
          
          <p className="text-white/50 text-xs text-center mt-2">
            After authorizing, you'll be redirected back
          </p>
        </div>
      )}

      {!scriptLoaded && !isMobile && !scriptError && (
        <div className="flex justify-center py-2">
          <div className="text-white/50 text-sm animate-pulse">Loading Telegram login...</div>
        </div>
      )}

      {/* Show user info after successful login */}
      {formData.telegramData && (
        <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-200 text-sm font-medium mb-2">
            ✓ Successfully connected!
          </p>
          <div className="flex items-center gap-3">
            {formData.telegramData.photo_url && (
              <img 
                src={formData.telegramData.photo_url} 
                alt="Profile" 
                className="w-10 h-10 rounded-full"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div>
              <p className="text-white font-medium">
                {formData.telegramData.first_name} {formData.telegramData.last_name}
              </p>
              {formData.telegramData.username && (
                <p className="text-white/60 text-sm">
                  @{formData.telegramData.username}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {errors.telegram && (
        <p className="text-sm text-pink-200 text-center">
          {errors.telegram}
        </p>
      )}

      <button
        onClick={onNext}
        disabled={!formData.telegramData}
        className={`w-full text-white text-lg font-bold py-3 rounded-lg transition-all duration-200 ${
          formData.telegramData
            ? "bg-white/20 hover:bg-white/30 cursor-pointer"
            : "bg-white/5 cursor-not-allowed opacity-50"
        }`}
      >
        Continue to Next Step
      </button>

      <p className="text-white/50 text-xs text-center">
        We only access your basic profile information
      </p>
    </div>
  );
};

export default Step1TelegramContact;