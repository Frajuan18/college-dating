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
      let telegramId = null;

      if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        webApp.ready();
        telegramUser = webApp.initDataUnsafe?.user;
        
        if (telegramUser) {
          telegramId = telegramUser.id;
          console.log('Telegram user detected:', telegramUser);
        }
      } else {
        // Not in Telegram, check localStorage
        const savedUser = localStorage.getItem('telegramUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          telegramId = parsedUser.id;
          telegramUser = parsedUser;
        }
      }

      if (!telegramId) {
        console.log('No Telegram user found');
        setStatus('not_registered');
        setChecking(false);
        return;
      }

      // First check if user exists in users table
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('telegram_id', telegramId)
        .maybeSingle();

      if (userError) throw userError;

      if (user) {
        setUserName(user.first_name || 'User');
        
        // Then check student_verifications table for the latest status
        const { data: verifications, error: verifError } = await supabase
          .from('student_verifications')
          .select('status')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(1);

        if (verifError) throw verifError;

        if (verifications && verifications.length > 0) {
          console.log('Found verification status:', verifications[0].status);
          setStatus(verifications[0].status);
        } else {
          // User exists but no verifications yet
          setStatus('no_verification');
        }
      } else {
        // User not registered
        setStatus('not_registered');
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
    // Clear any stored data and go to step 1
    localStorage.removeItem('verificationInProgress');
    localStorage.removeItem('formData');
    navigate('/register');
  };

  // Show loading state
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
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // User not registered
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

  // User registered but no verification submitted yet
  if (status === 'no_verification') {
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
            </div>
          )}
        </nav>

        <main className="relative z-10 flex flex-col items-center justify-center px-6 py-16">
          <div className="max-w-3xl text-center">
            <h1 className="text-white text-5xl md:text-7xl font-bold mb-6">
              Welcome, {userName}!
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-10">
              Complete your verification to start matching.
            </p>
            <button 
              onClick={handleGetStarted}
              className="bg-white text-rose-600 font-bold px-8 py-4 rounded-full shadow-xl hover:scale-105 transition"
            >
              Complete Verification
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Show status from student_verifications table
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
            {status === 'approved' && (
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

          {/* Status from student_verifications table */}
          {status === 'pending' && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-yellow-400/30">
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-400/20 p-4 rounded-full">
                  <HiOutlineClock className="w-12 h-12 text-yellow-400" />
                </div>
              </div>
              <h3 className="text-white text-2xl font-bold mb-3">Verification Pending</h3>
              <p className="text-white/80 mb-4">
                Your student ID is being reviewed by our admin team. This usually takes 24-48 hours.
              </p>
              <div className="bg-yellow-400/10 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">Status: Under Review</p>
              </div>
            </div>
          )}

          {status === 'approved' && (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-green-500/20 rounded-full p-4 mb-2">
                <HiOutlineCheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <h3 className="text-white text-2xl font-bold mb-2">Verification Approved!</h3>
              <p className="text-white/80 mb-6">
                Your student status has been verified. You now have full access!
              </p>
              <button 
                onClick={handleGoHome}
                className="bg-green-500 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:bg-green-600 hover:scale-105 transition flex items-center justify-center gap-2 min-w-[200px]"
              >
                <HiOutlineHome className="w-5 h-5" />
                Go to Home Page
              </button>
            </div>
          )}

          {status === 'rejected' && (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-red-500/20 rounded-full p-4 mb-2">
                <HiOutlineXCircle className="w-16 h-16 text-red-400" />
              </div>
              <h3 className="text-white text-2xl font-bold mb-2">Verification Rejected</h3>
              <p className="text-white/80 mb-2">
                Your verification was not approved. Common reasons:
              </p>
              <ul className="text-white/70 text-sm mb-6 space-y-2 text-left bg-red-500/10 p-4 rounded-lg max-w-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span>Photo is blurry or unclear</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span>Student ID number not visible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span>Information doesn't match</span>
                </li>
              </ul>
              <button 
                onClick={handleTryAgain}
                className="bg-red-500 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:bg-red-600 hover:scale-105 transition flex items-center justify-center gap-2 min-w-[200px]"
              >
                <HiOutlineRefresh className="w-5 h-5" />
                Try Again (Step 1)
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CoverPage;