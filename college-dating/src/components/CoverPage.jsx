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
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      // Get telegram data from localStorage (saved during registration)
      const telegramData = JSON.parse(localStorage.getItem('telegramUser') || '{}');
      const telegramId = telegramData.id || localStorage.getItem('telegramId');
      
      if (!telegramId) {
        console.log('No telegram user found');
        setLoading(false);
        return;
      }

      console.log('Checking status for telegram ID:', telegramId);

      // Get user from users table using telegram_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, verification_status')
        .eq('telegram_id', telegramId)
        .maybeSingle();

      if (userError) throw userError;

      if (userData) {
        console.log('User found:', userData);
        setUserId(userData.id);
        setUserName(`${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User');
        setVerificationStatus(userData.verification_status);
      } else {
        console.log('No user found with telegram ID:', telegramId);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    navigate('/register');
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // Render different content based on verification status
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
      );
    }

    // No user logged in
    if (!localStorage.getItem('telegramId') && !localStorage.getItem('telegramUser')) {
      return (
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button 
            onClick={handleGetStarted}
            className="bg-white text-rose-600 text-base sm:text-lg font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full shadow-xl hover:scale-105 transition-transform duration-200 active:scale-95 w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2"
          >
            <HiOutlineUser className="w-5 h-5" />
            <span>Get Started Free</span>
          </button>
          <button 
            onClick={handleLogin}
            className="bg-white/20 backdrop-blur-md border-2 border-white/40 text-white text-base sm:text-lg font-semibold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full hover:bg-white/30 transition active:bg-white/40 w-full sm:w-auto min-w-[200px]"
          >
            Login
          </button>
        </div>
      );
    }

    // User is logged in - show status-based content from users table
    switch (verificationStatus) {
      case 'pending':
        return (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-yellow-400/30">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-yellow-400/20 p-4 rounded-full">
                <HiOutlineClock className="w-10 h-10 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-white text-2xl font-bold mb-3">Verification Pending</h3>
            <p className="text-white/80 text-sm mb-6">
              Your student verification is currently being reviewed by our admin team.
              This usually takes 24-48 hours. You'll be notified once it's complete.
            </p>
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-yellow-300 font-medium">Status:</span>
                <span className="text-yellow-300 bg-yellow-400/20 px-3 py-1 rounded-full text-xs font-semibold">
                  UNDER REVIEW
                </span>
              </div>
              {userName && (
                <p className="text-white/60 text-xs mt-3 text-left">
                  Welcome back, {userName}
                </p>
              )}
            </div>
            {/* No button for pending - user stays on cover page */}
          </div>
        );

      case 'verified':
        return (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-green-400/30">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-400/20 p-4 rounded-full">
                <HiOutlineCheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </div>
            <h3 className="text-white text-2xl font-bold mb-3">Verification Approved!</h3>
            <p className="text-white/80 text-sm mb-6">
              Your student status has been verified successfully. You now have access to all features.
            </p>
            {userName && (
              <p className="text-white/60 text-sm mb-4">
                Welcome back, {userName}
              </p>
            )}
            <button 
              onClick={handleGoHome}
              className="bg-green-500 text-white text-base font-semibold px-8 py-3 rounded-full hover:bg-green-600 transition-all duration-200 hover:scale-105 w-full flex items-center justify-center gap-2"
            >
              <HiOutlineHome className="w-5 h-5" />
              <span>Go to Home</span>
            </button>
          </div>
        );

      case 'rejected':
        return (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-red-400/30">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-400/20 p-4 rounded-full">
                <HiOutlineXCircle className="w-10 h-10 text-red-400" />
              </div>
            </div>
            <h3 className="text-white text-2xl font-bold mb-3">Verification Rejected</h3>
            <p className="text-white/80 text-sm mb-4">
              Your verification was not approved. This could be due to:
            </p>
            <ul className="text-white/70 text-xs mb-6 space-y-2 text-left bg-red-400/5 p-4 rounded-xl">
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Unclear or blurry photo of your ID</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Student ID number not clearly visible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>University name doesn't match our records</span>
              </li>
            </ul>
            <p className="text-white/80 text-sm mb-6">
              Please try again with a clearer photo and correct information.
            </p>
            <button 
              onClick={handleTryAgain}
              className="bg-red-500 text-white text-base font-semibold px-8 py-3 rounded-full hover:bg-red-600 transition-all duration-200 hover:scale-105 w-full flex items-center justify-center gap-2"
            >
              <HiOutlineRefresh className="w-5 h-5" />
              <span>Try Again</span>
            </button>
          </div>
        );

      default:
        // User logged in but no verification status (null or undefined)
        return (
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button 
              onClick={handleGetStarted}
              className="bg-white text-rose-600 text-base sm:text-lg font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full shadow-xl hover:scale-105 transition-transform duration-200 active:scale-95 w-full sm:w-auto min-w-[200px]"
            >
              Complete Verification
            </button>
            <button 
              onClick={handleGoHome}
              className="bg-white/20 backdrop-blur-md border-2 border-white/40 text-white text-base sm:text-lg font-semibold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full hover:bg-white/30 transition active:bg-white/40 w-full sm:w-auto min-w-[200px]"
            >
              Browse as Guest
            </button>
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-rose-50">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1516589174184-c685266d4af4?q=80&w=2000&auto=format&fit=crop')` 
        }}
      >
        {/* Consistent gradient for all screens - dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/95 via-rose-800/90 to-rose-900/95" />
        
        {/* Slight dark overlay for extra text contrast */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex justify-between items-center px-6 py-6 md:px-8 lg:px-16">
        <div className="text-white text-2xl font-bold tracking-tighter drop-shadow-lg">
          MATCH<span className="text-pink-200">MAKER</span>
        </div>
        {userName && verificationStatus && (
          <div className="text-white/80 text-sm bg-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
            <HiOutlineUser className="w-4 h-4" />
            <span className="max-w-[150px] truncate">{userName}</span>
            {verificationStatus === 'verified' && (
              <span className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full">
                ✓ Verified
              </span>
            )}
          </div>
        )}
      </nav>

      {/* Main Hero Content - Centered */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 md:px-8 lg:px-16">
        <div className="max-w-3xl text-center">
          {/* Centered Title */}
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-4 md:mb-6 drop-shadow-lg">
            Find your <span className="text-pink-200">Perfect match</span> Today.
          </h1>
          
          {/* Centered Description */}
          <p className="text-white/95 text-base sm:text-lg md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow">
            Join thousands of people finding meaningful connections every day. 
            Your journey to a perfect partner starts with a single click.
          </p>

          {/* Dynamic Content based on verification status from users table */}
          <div className="mt-8">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoverPage;