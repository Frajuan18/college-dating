// components/Step1TelegramContact.jsx
import React, { useEffect, useState } from 'react';

const Step1TelegramContact = ({
  formData,
  errors,
  onTelegramShare,
  onNext,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const botUsername = 'collegedatingbot';
  const redirectUrl = 'https://college-dating.vercel.app';

  // Check if we're returning from Telegram redirect
  useEffect(() => {
    // Check URL hash for Telegram data (Telegram widget returns data in hash)
    if (window.location.hash) {
      try {
        // Parse the hash (remove # and parse)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const userData = {};
        
        // Extract user data from hash
        for (const [key, value] of hashParams) {
          if (key.startsWith('tg_')) {
            userData[key.replace('tg_', '')] = value;
          }
        }
        
        if (Object.keys(userData).length > 0) {
          onTelegramShare(userData);
          // Clear the hash
          window.location.hash = '';
        }
      } catch (error) {
        console.error('Error parsing Telegram data:', error);
      }
    }
  }, [onTelegramShare]);

  const handleTelegramLogin = () => {
    setIsLoading(true);
    
    // Use the embed code from your settings - this is the correct way
    const telegramLoginUrl = `https://oauth.telegram.org/embed/${botUsername}?origin=${encodeURIComponent(redirectUrl)}&return_to=${encodeURIComponent(redirectUrl)}&size=large&request_access=write&userpic=true&radius=8`;
    
    // Open in popup
    const width = 600;
    const height = 500;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      telegramLoginUrl,
      'Telegram Login',
      `width=${width},height=${height},top=${top},left=${left}`
    );

    // Listen for message from popup
    const handleMessage = (event) => {
      if (event.origin === 'https://oauth.telegram.org') {
        if (event.data && event.data.user) {
          onTelegramShare(event.data.user);
          popup?.close();
          setIsLoading(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Clean up listener after popup closes
    const checkPopup = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopup);
        window.removeEventListener('message', handleMessage);
        setIsLoading(false);
      }
    }, 1000);
  };

  // Alternative: Just use the embed code directly
  useEffect(() => {
    // Add the Telegram widget script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?23';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-auth-url', redirectUrl);
    script.async = true;
    
    const container = document.getElementById('telegram-widget-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
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
          Login with Telegram
        </h2>
        <p className="text-white/70 mb-4">
          Securely login using your Telegram account
        </p>
        
        <div className="bg-white/10 rounded-lg p-6 mb-4 border-2 border-white/20">
          {loginError && (
            <div className="mb-4 p-3 bg-red-500/20 rounded-lg text-red-200 text-sm">
              {loginError}
            </div>
          )}
          
          {/* Option 1: Custom Button */}
          <button
            onClick={handleTelegramLogin}
            disabled={isLoading}
            className="w-full bg-[#0088cc] text-white text-lg font-bold py-4 rounded-lg hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-3 mb-4 shadow-lg disabled:opacity-50"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.892 8.915c-.14.646-.52.803-1.054.5l-2.915-2.148-1.41 1.356c-.156.156-.287.287-.588.287l.21-2.98 5.425-4.903c.236-.21-.052-.328-.366-.118l-6.71 4.225-2.887-.96c-.63-.196-.642-.63.13-.934l11.27-4.344c.525-.194.985.128.814.904z"/>
            </svg>
            {isLoading ? 'Opening Telegram...' : 'Login with Telegram'}
          </button>

          {/* Option 2: Official Telegram Widget */}
          <div className="mt-4">
            <p className="text-white/50 text-sm mb-2">Or use the official widget:</p>
            <div 
              id="telegram-widget-container" 
              className="flex justify-center"
            ></div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-500/20 rounded-lg">
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

      {formData.telegramData && (
        <div className="text-center">
          <div className="bg-green-500/20 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 justify-center">
              {formData.telegramData.photo_url && (
                <img 
                  src={formData.telegramData.photo_url} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full border-2 border-green-400"
                />
              )}
              <div className="text-left">
                <p className="text-white font-medium">
                  Logged in as {formData.telegramData.first_name} {formData.telegramData.last_name}
                </p>
                <p className="text-white/60 text-sm">
                  @{formData.telegramData.username}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full bg-white text-rose-600 text-lg font-bold py-3 rounded-lg hover:scale-105 transition-transform duration-200"
          >
            Continue to Next Step →
          </button>
        </div>
      )}
    </div>
  );
};

export default Step1TelegramContact;