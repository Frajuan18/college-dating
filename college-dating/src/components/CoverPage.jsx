// CoverPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle,
  HiOutlineHome,
  HiOutlineRefresh,
  HiOutlineUser 
} from 'react-icons/hi';

const CoverPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [userName, setUserName] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkTelegramUser();
  }, []);

  const checkTelegramUser = async () => {
    try {
      // Check if we're inside Telegram Web App
      let telegramUser = null;

      if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        webApp.ready();
        telegramUser = webApp.initDataUnsafe?.user;
        
        if (telegramUser) {
          console.log('Telegram user detected:', telegramUser);
          
          // Check if user exists in database
          const { data: user, error } = await supabase
            .from('users')
            .select('id, first_name, last_name, verification_status')
            .eq('telegram_id', telegramUser.id)
            .maybeSingle();

          if (error) throw error;

          if (user) {
            console.log('User found in database:', user);
            setUserName(user.first_name || 'User');
            setStatus(user.verification_status);
          } else {
            console.log('User not registered yet');
            setStatus('not_registered');
          }
        }
      } else {
        // Not in Telegram, check localStorage as fallback
        const savedUser = localStorage.getItem('telegramUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          telegramUser = parsedUser;
          
          const { data: user } = await supabase
            .from('users')
            .select('id, first_name, last_name, verification_status')
            .eq('telegram_id', parsedUser.id)
            .maybeSingle();

          if (user) {
            setUserName(user.first_name || 'User');
            setStatus(user.verification_status);
          } else {
            setStatus('not_registered');
          }
        } else {
          setStatus('not_registered');
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setStatus('not_registered');
    } finally {
      setChecking(false);
    }
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleTryAgain = () => {
    navigate('/register');
  };

  // Don't show checking state to user - just show buttons quickly
  if (checking) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516589174184-c685266d4af4?q=80&w=2000&auto=format&fit=crop')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-rose-900/95 via-rose-800/90 to-rose-900/95" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <nav className="relative z-10 flex justify-between items-center px-6 py-6">
          <div className="text-white text-2xl font-bold">
            MATCH<span className="text-pink-200">MAKER</span>
          </div>
        </nav>

        <main className="relative z-10 flex flex-col items-center justify-center px-6 py-16">
          <div className="max-w-3xl text-center">
            <h1 className="text-white text-5xl md:text-7xl font-bold mb-6">
              Find your <span className="text-pink-200">Perfect match</span>
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-10">
              Join thousands finding meaningful connections every day.
            </p>
            {/* Show Get Started button immediately while checking */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleGetStarted}
                className="bg-white text-rose-600 font-bold px-8 py-4 rounded-full shadow-xl hover:scale-105 transition w-full sm:w-auto min-w-[200px]"
              >
                Get Started
              </button>
              <button 
                onClick={handleLogin}
                className="bg-white/20 backdrop-blur-md border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/30 transition w-full sm:w-auto min-w-[200px]"
              >
                Login
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // User not registered or not in Telegram
  if (status === 'not_registered') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516589174184-c685266d4af4?q=80&w=2000&auto=format&fit=crop')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-rose-900/95 via-rose-800/90 to-rose-900/95" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <nav className="relative z-10 flex justify-between items-center px-6 py-6">
          <div className="text-white text-2xl font-bold">
            MATCH<span className="text-pink-200">MAKER</span>
          </div>
        </nav>

        <main className="relative z-10 flex flex-col items-center justify-center px-6 py-16">
          <div className="max-w-3xl text-center">
            <h1 className="text-white text-5xl md:text-7xl font-bold mb-6">
              Find your <span className="text-pink-200">Perfect match</span>
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-10">
              Join thousands finding meaningful connections every day.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleGetStarted}
                className="bg-white text-rose-600 font-bold px-8 py-4 rounded-full shadow-xl hover:scale-105 transition w-full sm:w-auto min-w-[200px]"
              >
                Get Started
              </button>
              <button 
                onClick={handleLogin}
                className="bg-white/20 backdrop-blur-md border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/30 transition w-full sm:w-auto min-w-[200px]"
              >
                Login
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // User is registered - show status-based UI
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516589174184-c685266d4af4?q=80&w=2000&auto=format&fit=crop')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/95 via-rose-800/90 to-rose-900/95" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <nav className="relative z-10 flex justify-between items-center px-6 py-6">
        <div className="text-white text-2xl font-bold">
          MATCH<span className="text-pink-200">MAKER</span>
        </div>
        {userName && (
          <div className="text-white/80 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
            <HiOutlineUser className="w-4 h-4" />
            <span>{userName}</span>
            {status === 'verified' && (
              <span className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full ml-2">
                ✓
              </span>
            )}
          </div>
        )}
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-3xl text-center">
          <h1 className="text-white text-5xl md:text-7xl font-bold mb-6">
            Find your <span className="text-pink-200">Perfect match</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-10">
            Join thousands finding meaningful connections every day.
          </p>

          {/* Status-based buttons */}
          {status === 'pending' && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-yellow-400/30">
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-400/20 p-4 rounded-full">
                  <HiOutlineClock className="w-12 h-12 text-yellow-400" />
                </div>
              </div>
              <h3 className="text-white text-2xl font-bold mb-3">Verification Pending</h3>
              <p className="text-white/80">
                Your account is being reviewed by our team.
              </p>
            </div>
          )}

          {status === 'verified' && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleGoHome}
                className="bg-green-500 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:bg-green-600 hover:scale-105 transition w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2"
              >
                <HiOutlineHome className="w-5 h-5" />
                Go to Home
              </button>
            </div>
          )}

          {status === 'rejected' && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleTryAgain}
                className="bg-red-500 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:bg-red-600 hover:scale-105 transition w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2"
              >
                <HiOutlineRefresh className="w-5 h-5" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CoverPage;