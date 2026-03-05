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
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      // Get telegram data from localStorage
      const telegramData = JSON.parse(localStorage.getItem('telegramUser') || '{}');
      const telegramId = telegramData.id || localStorage.getItem('telegramId');
      
      if (!telegramId) {
        console.log('No user logged in');
        setLoading(false);
        return;
      }

      console.log('Checking status for:', telegramId);

      // First check users table
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, verification_status')
        .eq('telegram_id', telegramId)
        .maybeSingle();

      if (userError) throw userError;

      if (user) {
        console.log('User found:', user);
        setUserName(`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User');
        
        // If user has verification_status, use that
        if (user.verification_status) {
          console.log('Setting status from users table:', user.verification_status);
          setStatus(user.verification_status);
          setLoading(false);
          return;
        }
      }

      // If no status in users table, check student_verifications
      if (user) {
        const { data: verifications, error: verifError } = await supabase
          .from('student_verifications')
          .select('status')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(1);

        if (verifError) throw verifError;

        if (verifications && verifications.length > 0) {
          console.log('Setting status from verifications table:', verifications[0].status);
          
          // Update users table with this status
          await supabase
            .from('users')
            .update({ verification_status: verifications[0].status })
            .eq('id', user.id);
          
          setStatus(verifications[0].status);
        } else {
          setStatus(null);
        }
      } else {
        setStatus(null);
      }

    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    if (status === 'approved' || status === 'verified') {
      navigate('/home');
    } else if (status === 'rejected') {
      navigate('/register');
    } else {
      navigate('/register');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  // Render based on status
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
      );
    }

    // No user logged in
    if (!localStorage.getItem('telegramId') && !localStorage.getItem('telegramUser')) {
      return (
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={handleGetStarted}
            className="bg-white text-rose-600 font-bold px-8 py-4 rounded-full shadow-xl hover:scale-105 transition w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2"
          >
            <HiOutlineUser className="w-5 h-5" />
            Get Started
          </button>
          <button 
            onClick={handleLogin}
            className="bg-white/20 backdrop-blur-md border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/30 transition w-full sm:w-auto min-w-[200px]"
          >
            Login
          </button>
        </div>
      );
    }

    // Show different UI based on status
    switch (status) {
      case 'pending':
        return (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-yellow-400/30">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-400/20 p-4 rounded-full">
                <HiOutlineClock className="w-12 h-12 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-white text-2xl font-bold mb-3">Pending Review</h3>
            <p className="text-white/80 mb-4">
              Your verification is being reviewed by admin.
            </p>
            <div className="bg-yellow-400/10 rounded-lg p-4">
              <p className="text-yellow-300 font-medium">Status: Under Review</p>
              {userName && <p className="text-white/60 text-sm mt-2">{userName}</p>}
            </div>
          </div>
        );

      case 'approved':
      case 'verified':
        return (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-green-400/30">
            <div className="flex justify-center mb-4">
              <div className="bg-green-400/20 p-4 rounded-full">
                <HiOutlineCheckCircle className="w-12 h-12 text-green-400" />
              </div>
            </div>
            <h3 className="text-white text-2xl font-bold mb-3">Verified!</h3>
            <p className="text-white/80 mb-6">
              Your student status has been verified.
            </p>
            <button 
              onClick={() => navigate('/home')}
              className="bg-green-500 text-white font-semibold px-8 py-3 rounded-full hover:bg-green-600 hover:scale-105 transition w-full flex items-center justify-center gap-2"
            >
              <HiOutlineHome className="w-5 h-5" />
              Go to Home
            </button>
          </div>
        );

      case 'rejected':
        return (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-red-400/30">
            <div className="flex justify-center mb-4">
              <div className="bg-red-400/20 p-4 rounded-full">
                <HiOutlineXCircle className="w-12 h-12 text-red-400" />
              </div>
            </div>
            <h3 className="text-white text-2xl font-bold mb-3">Not Verified</h3>
            <p className="text-white/80 mb-6">
              Your verification was rejected. Please try again.
            </p>
            <button 
              onClick={() => navigate('/register')}
              className="bg-red-500 text-white font-semibold px-8 py-3 rounded-full hover:bg-red-600 hover:scale-105 transition w-full flex items-center justify-center gap-2"
            >
              <HiOutlineRefresh className="w-5 h-5" />
              Try Again
            </button>
          </div>
        );

      default:
        return (
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-rose-600 font-bold px-8 py-4 rounded-full shadow-xl hover:scale-105 transition w-full sm:w-auto min-w-[200px]"
            >
              Verify Now
            </button>
            <button 
              onClick={() => navigate('/home')}
              className="bg-white/20 backdrop-blur-md border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/30 transition w-full sm:w-auto min-w-[200px]"
            >
              Browse
            </button>
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516589174184-c685266d4af4?q=80&w=2000&auto=format&fit=crop')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/95 via-rose-800/90 to-rose-900/95" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Navbar */}
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

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-3xl text-center">
          <h1 className="text-white text-5xl md:text-7xl font-bold mb-6">
            Find your <span className="text-pink-200">Perfect match</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-10">
            Join thousands finding meaningful connections every day.
          </p>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default CoverPage;