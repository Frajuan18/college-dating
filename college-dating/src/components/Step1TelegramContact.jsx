import React, { useState } from 'react';

const Step1TelegramContact = ({ isOpen, onClose, onVerified }) => {
  const [step, setStep] = useState('connect'); // connect | enter-code | verified
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  
  const botUsername = 'collegedatingbot';

  const handleOpenTelegram = () => {
    window.open(`https://t.me/${botUsername}`, '_blank');
    setStep('enter-code');
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError('');
    
    // Simulating your API call
    try {
      const response = await fetch('/api/verify-telegram-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      });
      const data = await response.json();

      if (data.verified) {
        setStep('verified');
        // This is where you connect the profile
        onVerified(data.user); 
      } else {
        setError('Invalid code. Please check your Telegram.');
      }
    } catch (e) {
      setError('Connection failed. Try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        
        {/* Subtle background decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        <button onClick={onClose} className="absolute top-4 right-6 text-white/70 hover:text-white text-2xl">&times;</button>

        {step === 'connect' && (
          <div className="text-center">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.892 8.915c-.14.646-.52.803-1.054.5l-2.915-2.148-1.41 1.356c-.156.156-.287.287-.588.287l.21-2.98 5.425-4.903c.236-.21-.052-.328-.366-.118l-6.71 4.225-2.887-.96c-.63-.196-.642-.63.13-.934l11.27-4.344c.525-.194.985.128.814.904z" />
              </svg>
            </div>
            <h2 className="text-white text-3xl font-bold mb-2">Join the Club</h2>
            <p className="text-pink-100 mb-8 text-sm">To keep our community safe, we verify everyone via Telegram.</p>
            
            <button 
              onClick={handleOpenTelegram}
              className="w-full bg-white text-rose-600 font-bold py-4 rounded-xl shadow-lg hover:bg-rose-50 transition active:scale-95 mb-4"
            >
              Continue with Telegram
            </button>
            <p className="text-white/60 text-xs">A chat window will open in a new tab.</p>
          </div>
        )}

        {step === 'enter-code' && (
          <div className="text-center animate-in fade-in duration-300">
            <h2 className="text-white text-2xl font-bold mb-2">Check Telegram</h2>
            <p className="text-pink-100 mb-6 text-sm">Enter the 6-digit code our bot just sent you.</p>
            
            <input 
              type="text"
              maxLength="6"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000 000"
              className="w-full bg-white/20 border-2 border-white/30 rounded-xl py-4 text-center text-3xl text-white tracking-[0.5em] focus:outline-none focus:border-white mb-4 placeholder:text-white/30"
            />

            {error && <p className="text-yellow-200 text-sm mb-4">{error}</p>}

            <button 
              onClick={handleVerify}
              disabled={isVerifying || verificationCode.length < 6}
              className="w-full bg-white text-rose-600 font-bold py-4 rounded-xl shadow-lg hover:bg-rose-50 transition disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify & Link Profile'}
            </button>
            
            <button onClick={() => setStep('connect')} className="mt-6 text-white/70 text-sm hover:underline">Change account</button>
          </div>
        )}

        {step === 'verified' && (
          <div className="text-center animate-in zoom-in duration-300">
            <div className="bg-green-400/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-300">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Profile Linked!</h2>
            <p className="text-pink-100 mb-8">Telegram account connected successfully. Let's finish your profile.</p>
            
            <button 
              onClick={() => window.location.href = '/onboarding'}
              className="w-full bg-white text-rose-600 font-bold py-4 rounded-xl shadow-lg hover:bg-rose-50 transition"
            >
              Complete Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1TelegramContact;