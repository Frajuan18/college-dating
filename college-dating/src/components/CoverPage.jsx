// pages/CoverPage.jsx
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
    checkUserAndRedirect();
  }, []);

  const checkUserAndRedirect = async () => {
    try {
      // Get telegram data
      const telegramData = JSON.parse(localStorage.getItem('telegramUser') || '{}');
      const telegramId = telegramData.id || localStorage.getItem('telegramId');
      
      if (!telegramId) {
        setStatus('not_registered');
        setChecking(false);
        return;
      }

      // Get user from database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('telegram_id', telegramId)
        .maybeSingle();

      if (userError) throw userError;

      if (user) {
        setUserName(user.first_name || 'User');
        
        // Check verification status from student_verifications
        const { data: verifications, error: verifError } = await supabase
          .from('student_verifications')
          .select('status')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(1);

        if (verifError) throw verifError;

        if (verifications && verifications.length > 0) {
          const currentStatus = verifications[0].status;
          setStatus(currentStatus);
          
          // ✅ AUTO-REDIRECT IF VERIFIED
          if (currentStatus === 'approved') {
            navigate('/home');
            return;
          }
        } else {
          setStatus('no_verification');
        }
      } else {
        setStatus('not_registered');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('not_registered');
    } finally {
      setChecking(false);
    }
  };

  const handleGetStarted = () => navigate('/register');
  const handleGoHome = () => navigate('/home');
  const handleTryAgain = () => {
    localStorage.removeItem('verificationInProgress');
    localStorage.removeItem('formData');
    navigate('/register');
  };

  // Show nothing while checking (prevents flash)
  if (checking) return null;

  // Not registered
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
            <button 
              onClick={handleGetStarted}
              className="bg-white text-rose-600 font-bold px-8 py-4 rounded-full shadow-xl hover:scale-105 transition"
            >
              Get Started
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Registered but no verification
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
          <div className="text-white/80 bg-white/10 px-4 py-2 rounded-full">
            <HiOutlineUser className="w-5 h-5 inline mr-2" />
            {userName}
          </div>
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

  // Pending
  if (status === 'pending') {
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
          <div className="text-white/80 bg-white/10 px-4 py-2 rounded-full">
            <HiOutlineUser className="w-5 h-5 inline mr-2" />
            {userName}
          </div>
        </nav>

        <main className="relative z-10 flex flex-col items-center justify-center px-6 py-16">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md border border-yellow-400/30">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-400/20 p-4 rounded-full">
                <HiOutlineClock className="w-12 h-12 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-white text-2xl font-bold mb-3 text-center">Verification Pending</h3>
            <p className="text-white/80 text-center">
              Your student ID is being reviewed. This usually takes 24-48 hours.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Rejected
  if (status === 'rejected') {
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
          <div className="text-white/80 bg-white/10 px-4 py-2 rounded-full">
            <HiOutlineUser className="w-5 h-5 inline mr-2" />
            {userName}
          </div>
        </nav>

        <main className="relative z-10 flex flex-col items-center justify-center px-6 py-16">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md border border-red-400/30">
            <div className="flex justify-center mb-4">
              <div className="bg-red-400/20 p-4 rounded-full">
                <HiOutlineXCircle className="w-12 h-12 text-red-400" />
              </div>
            </div>
            <h3 className="text-white text-2xl font-bold mb-3 text-center">Verification Rejected</h3>
            <p className="text-white/80 text-center mb-6">
              Your verification was not approved. Please try again with a clearer photo.
            </p>
            <button 
              onClick={handleTryAgain}
              className="bg-red-500 text-white font-bold px-8 py-3 rounded-full hover:bg-red-600 transition w-full flex items-center justify-center gap-2"
            >
              <HiOutlineRefresh className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Approved (should never see this because of redirect)
  return null;
};

export default CoverPage;