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
  const [domainError, setDomainError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check URL for Telegram callback data
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('id')) {
      const tgData = {
        id: urlParams.get('id'),
        first_name: urlParams.get('first_name'),
        last_name: urlParams.get('last_name'),
        username: urlParams.get('username'),
        photo_url: urlParams.get('photo_url'),
        auth_date: urlParams.get('auth_date'),
        hash: urlParams.get('hash')
      };
      
      console.log('Telegram callback received:', tgData);
      onTelegramShare(tgData);
      
      // Clean URL
      navigate(window.location.pathname, { replace: true });
    }
  }, [navigate, onTelegramShare]);

  useEffect(() => {
    if (telegramContainerRef.current) {
      telegramContainerRef.current.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?23';
      script.setAttribute('data-telegram-login', 'collegedatingbot');
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-auth-url', 'https://college-dating.vercel.app/');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      
      script.onload = () => {
        setScriptLoaded(true);
        // Check if widget rendered properly
        setTimeout(() => {
          if (telegramContainerRef.current?.children.length === 1) {
            // Widget might have failed silently
            const iframe = telegramContainerRef.current.querySelector('iframe');
            if (iframe && iframe.src.includes('error')) {
              setDomainError(true);
            }
          }
        }, 1000);
      };
      
      script.onerror = () => {
        setScriptError(true);
      };
      
      telegramContainerRef.current.appendChild(script);
    }
  }, []);

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
        <p className="text-white/70 mb-6">
          Sign in with Telegram to verify your account
        </p>
      </div>

      {domainError && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-200 text-sm text-center font-medium">
            ❌ Bot domain invalid
          </p>
          <p className="text-red-200/70 text-xs text-center mt-2">
            Current domain: college-dating.vercel.app<br/>
            Please make sure this exact domain is set in @BotFather
          </p>
        </div>
      )}

      {!scriptLoaded && !scriptError && !domainError && (
        <div className="flex justify-center py-4">
          <div className="animate-pulse text-white/50">Loading Telegram login...</div>
        </div>
      )}

      <div 
        ref={telegramContainerRef}
        className="flex justify-center min-h-[60px]"
      />

      {formData.telegramData && (
        <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-200 text-sm font-medium mb-2">
            ✓ Successfully verified
          </p>
          <div className="flex items-center gap-3">
            {formData.telegramData.photo_url && (
              <img src={formData.telegramData.photo_url} alt="Profile" className="w-10 h-10 rounded-full" />
            )}
            <div>
              <p className="text-white font-medium">
                {formData.telegramData.first_name} {formData.telegramData.last_name}
              </p>
              {formData.telegramData.username && (
                <p className="text-white/60 text-sm">@{formData.telegramData.username}</p>
              )}
            </div>
          </div>
        </div>
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
        Continue
      </button>
    </div>
  );
};

export default Step1TelegramContact;