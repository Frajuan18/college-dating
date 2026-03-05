// CoverPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle,
  HiOutlineHome,
  HiOutlineRefresh 
} from 'react-icons/hi';

const CoverPage = () => {
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      // Check if user is logged in
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setLoading(false);
        return;
      }

      setUser(authUser);

      // Get user's email to find in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .maybeSingle();

      if (userError) throw userError;

      if (userData) {
        // Check if user has any verifications
        const { data: verifications, error: verifError } = await supabase
          .from('student_verifications')
          .select('status')
          .eq('user_id', userData.id)
          .order('submitted_at', { ascending: false })
          .limit(1);

        if (verifError) throw verifError;

        if (verifications && verifications.length > 0) {
          setVerificationStatus(verifications[0].status);
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
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

  // Render different content based on verification status
  const renderAuthButtons = () => {
    if (loading) {
      return (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      );
    }

    if (!user) {
      // Not logged in - show Get Started and Login buttons
      return (
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button 
            onClick={() => navigate('/register')}
            className="bg-white text-rose-600 text-base sm:text-lg font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full shadow-xl hover:scale-105 transition-transform duration-200 active:scale-95 w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2"
          >
            <span>Get Started Free</span>
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="bg-white/20 backdrop-blur-md border-2 border-white/40 text-white text-base sm:text-lg font-semibold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full hover:bg-white/30 transition active:bg-white/40 w-full sm:w-auto min-w-[200px]"
          >
            Login
          </button>
        </div>
      );
    }

    // User is logged in - show status-based buttons
    switch (verificationStatus) {
      case 'pending':
        return (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md mx-auto border border-yellow-400/30">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-yellow-400/20 p-3 rounded-full">
                <HiOutlineClock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Verification Pending</h3>
            <p className="text-white/80 text-sm mb-4">
              Your student verification is currently being reviewed by our admin team.
              This usually takes 24-48 hours. You'll be notified once it's complete.
            </p>
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3">
              <p className="text-yellow-300 text-xs">
                <span className="font-semibold">Status:</span> Under Review
              </p>
            </div>
          </div>
        );

      case 'approved':
        return (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md mx-auto border border-green-400/30">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-400/20 p-3 rounded-full">
                <HiOutlineCheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Verification Approved!</h3>
            <p className="text-white/80 text-sm mb-4">
              Your student status has been verified successfully. You now have access to all features.
            </p>
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
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md mx-auto border border-red-400/30">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-400/20 p-3 rounded-full">
                <HiOutlineXCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">Verification Rejected</h3>
            <p className="text-white/80 text-sm mb-4">
              Your verification was not approved. This could be due to unclear photo or incorrect information.
              Please try again with a clearer photo.
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
        // User logged in but no verification yet - show standard buttons
        return (
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-rose-600 text-base sm:text-lg font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full shadow-xl hover:scale-105 transition-transform duration-200 active:scale-95 w-full sm:w-auto min-w-[200px]"
            >
              Complete Verification
            </button>
            <button 
              onClick={() => navigate('/home')}
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
        {user && (
          <div className="text-white/80 text-sm bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
            Welcome, {user.email?.split('@')[0] || 'User'}
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

          {/* Dynamic Buttons based on verification status */}
          <div className="mt-8">
            {renderAuthButtons()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoverPage;