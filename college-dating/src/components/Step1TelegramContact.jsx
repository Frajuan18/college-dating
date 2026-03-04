// components/Step1TelegramContact.jsx
import React, { useEffect, useState } from 'react';

const Step1TelegramContact = ({
  formData,
  errors,
  onTelegramShare,
  onNext,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  
  useEffect(() => {
    // Check if we're inside Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      // Mark that we're in Telegram
      setIsTelegramWebApp(true);
      
      // Tell Telegram that we're ready
      webApp.ready();
      
      // Get user data from Telegram
      const user = webApp.initDataUnsafe?.user;
      
      if (user) {
        // Transform Telegram user data to match our format
        const userData = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          language_code: user.language_code,
          is_premium: user.is_premium,
          // For Mini Apps, we automatically have the user
          isTelegramUser: true
        };
        
        // Auto-verify since user is already logged into Telegram
        onTelegramShare(userData);
      }
      
      setIsLoading(false);
    } else {
      // Not in Telegram - load the login widget for external users
      setIsTelegramWebApp(false);
      setIsLoading(false);
      
      // Load Telegram Login widget for external access
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?23';
      script.setAttribute('data-telegram-login', 'collegedatingbot');
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '8');
      script.setAttribute('data-request-access', 'write');
      script.setAttribute('data-userpic', 'true');
      script.setAttribute('data-auth-url', 'https://college-dating.vercel.app/api/telegram-auth');
      script.async = true;
      
      const container = document.getElementById('telegram-login-container');
      if (container) {
        container.innerHTML = '';
        container.appendChild(script);
      }
      
      // Listen for redirect response
      const handleAuth = (event) => {
        if (event.data && event.data.user) {
          onTelegramShare(event.data.user);
        }
      };
      
      window.addEventListener('message', handleAuth);
      return () => window.removeEventListener('message', handleAuth);
    }
  }, [onTelegramShare]);

  // If user is already in Telegram Web App and we have data
  if (formData.telegramData) {
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
          
          <div className="bg-white/10 rounded-lg p-4 mb-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 justify-center">
              {formData.telegramData.photo_url && (
                <img 
                  src={formData.telegramData.photo_url} 
                  alt="Profile" 
                  className="w-14 h-14 rounded-full border-2 border-green-400"
                />
              )}
              <div className="text-left">
                <p className="text-white font-medium text-lg">
                  {formData.telegramData.first_name} {formData.telegramData.last_name}
                </p>
                <p className="text-white/60 text-sm">
                  @{formData.telegramData.username || 'No username'}
                </p>
                {isTelegramWebApp && (
                  <p className="text-green-400 text-xs flex items-center gap-1">
                    <span>✓</span> Connected via Telegram
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg font-bold py-4 rounded-lg hover:scale-105 transition-transform duration-200 shadow-lg"
          >
            Continue to Next Step →
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // For users inside Telegram Web App (but somehow no data yet)
  if (isTelegramWebApp) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-yellow-500/20 rounded-lg p-6">
          <p className="text-yellow-200">
            Please close and reopen this app from Telegram to auto-connect.
          </p>
        </div>
      </div>
    );
  }

  // For external users (not in Telegram) - show login widget
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
          Login with Telegram
        </h2>
        <p className="text-white/70 mb-4">
          Connect your Telegram account to continue
        </p>
        
        <div className="bg-white/10 rounded-lg p-6 mb-4 border-2 border-white/20">
          {/* Telegram Login Widget Container */}
          <div 
            id="telegram-login-container" 
            className="flex justify-center min-h-[60px]"
          ></div>
          
          <div className="mt-4 p-4 bg-blue-500/20 rounded-lg">
            <p className="text-blue-200 text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Why login with Telegram?</strong><br/>
                • Quick and secure authentication<br/>
                • No password to remember<br/>
                • Your data stays private
              </span>
            </p>
          </div>

          <p className="text-white/50 text-xs mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step1TelegramContact;