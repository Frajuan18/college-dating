// Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [telegramData, setTelegramData] = useState(null);

  useEffect(() => {
    detectTelegramUser();
  }, []);

  const detectTelegramUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get Telegram data from multiple sources
      let telegramId = null;
      let telegramUserData = null;

      // Try to get from window.Telegram if available (Telegram Web App)
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        telegramId = tgUser.id;
        telegramUserData = {
          id: tgUser.id,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          username: tgUser.username,
          photo_url: tgUser.photo_url,
          language_code: tgUser.language_code,
          is_premium: tgUser.is_premium
        };
        console.log('Detected Telegram user from WebApp:', telegramUserData);
        
        // Save to localStorage for future use
        localStorage.setItem('telegramUser', JSON.stringify(telegramUserData));
        localStorage.setItem('telegramId', telegramId);
      } 
      // Try to get from localStorage
      else {
        const storedTelegramUser = localStorage.getItem('telegramUser');
        if (storedTelegramUser) {
          telegramUserData = JSON.parse(storedTelegramUser);
          telegramId = telegramUserData.id || localStorage.getItem('telegramId');
          console.log('Detected Telegram user from localStorage:', telegramUserData);
        }
      }

      if (!telegramId) {
        console.log('No Telegram user detected');
        setUser(null);
        setLoading(false);
        return;
      }

      setTelegramData(telegramUserData);

      // Find the user in the users table by telegram_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user:', userError);
        throw userError;
      }

      if (!userData) {
        console.log('No user found with telegram_id:', telegramId);
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('Found user in users table:', userData);

      // Get the latest verification for this user from student_verifications table
      const { data: verifications, error: verifError } = await supabase
        .from('student_verifications')
        .select('*')
        .eq('user_id', userData.id)
        .order('submitted_at', { ascending: false });

      if (verifError) {
        console.error('Error fetching verifications:', verifError);
      }

      // Combine user data with verification data
      const userWithVerification = {
        ...userData,
        verifications: verifications || [],
        hasVerification: verifications && verifications.length > 0,
        latestVerification: verifications && verifications.length > 0 ? verifications[0] : null
      };

      console.log('User with verification data:', userWithVerification);
      setUser(userWithVerification);

    } catch (err) {
      console.error('Error detecting Telegram user:', err);
      setError('Failed to load your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    try {
      if (!user) return;

      // Save complete user data to localStorage
      const userData = {
        id: user.id,
        telegram_id: user.telegram_id,
        first_name: user.first_name || telegramData?.first_name || '',
        last_name: user.last_name || telegramData?.last_name || '',
        full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        telegram_username: user.telegram_username || telegramData?.username || '',
        photo_url: user.photo_url || telegramData?.photo_url || null,
        language_code: user.language_code || telegramData?.language_code || null,
        is_premium: user.is_premium || telegramData?.is_premium || false,
        university_name: user.university_name || (user.latestVerification?.university_name) || '',
        department: user.department || (user.latestVerification?.department) || '',
        student_year: user.student_year || (user.latestVerification?.student_year) || '',
        student_id: user.student_id || (user.latestVerification?.student_id) || '',
        gender: user.gender || '',
        verification_status: user.verification_status || (user.latestVerification?.status) || 'pending',
        bio: user.bio || '',
        interests: user.interests || [],
        location: user.location || '',
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      localStorage.setItem('telegramUser', JSON.stringify(userData));
      localStorage.setItem('telegramId', user.telegram_id);
      localStorage.setItem('lastUser', JSON.stringify(userData));
      
      console.log('Logged in as:', userData.full_name || userData.first_name);
      
      // Redirect based on verification status
      if (userData.verification_status === 'verified' || userData.verification_status === 'approved') {
        navigate('/home');
      } else if (userData.verification_status === 'pending') {
        navigate('/verification-pending');
      } else if (userData.verification_status === 'rejected') {
        navigate('/verification-rejected');
      } else {
        // No verification or not verified
        navigate('/register');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    }
  };

  const handleNewRegistration = () => {
    // Clear any existing user data and go to registration
    localStorage.removeItem('lastUser');
    localStorage.removeItem('telegramUser');
    localStorage.removeItem('telegramId');
    navigate('/register');
  };

  const getInitials = (user) => {
    if (user.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getGradientColor = (gender) => {
    if (gender === 'female') {
      return 'bg-gradient-to-br from-pink-400 to-rose-500';
    } else if (gender === 'male') {
      return 'bg-gradient-to-br from-blue-400 to-indigo-500';
    }
    return 'bg-gradient-to-br from-purple-400 to-purple-600';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getVerificationStatusBadge = () => {
    if (!user) return null;
    
    const status = user.verification_status || user.latestVerification?.status;
    
    switch(status) {
      case 'verified':
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 text-xs sm:text-sm rounded-full mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified Student
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs sm:text-sm rounded-full mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Verification Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-300 text-xs sm:text-sm rounded-full mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Verification Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-300 text-xs sm:text-sm rounded-full mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Not Verified
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-rose-50">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1516589174184-c685266d4af4?q=80&w=2000&auto=format&fit=crop')` 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-rose-900/95 via-rose-800/90 to-rose-900/95" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-lg">Detecting your Telegram account...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-rose-50">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1516589174184-c685266d4af4?q=80&w=2000&auto=format&fit=crop')` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/95 via-rose-800/90 to-rose-900/95" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex justify-between items-center px-4 sm:px-6 py-4 sm:py-6">
        <Link to="/" className="text-white text-xl sm:text-2xl font-bold tracking-tighter drop-shadow-lg">
          MATCH<span className="text-pink-200">MAKER</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.1] mb-2 sm:mb-3 drop-shadow-lg">
              Welcome <span className="text-pink-200">back</span>
            </h1>
            <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-md mx-auto leading-relaxed drop-shadow px-4">
              {user ? 'Continue with your account' : 'Sign in with Telegram to continue'}
            </p>
            <div className="w-16 sm:w-20 h-1 bg-pink-200 mx-auto mt-3 sm:mt-4 rounded-full" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* User Account Card */}
          {user ? (
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-4 sm:mb-6">
              <div className="flex flex-col items-center text-center">
                {/* Profile Picture */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white/50 overflow-hidden mb-4 sm:mb-6 shadow-lg">
                  {user.photo_url || telegramData?.photo_url ? (
                    <img 
                      src={user.photo_url || telegramData?.photo_url} 
                      alt={user.full_name || `${user.first_name} ${user.last_name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add(getGradientColor(user.gender));
                      }}
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white ${getGradientColor(user.gender)}`}>
                      {getInitials(user)}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <h2 className="text-white font-bold text-xl sm:text-2xl mb-1">
                  {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'}
                </h2>
                
                {user.university_name && (
                  <p className="text-white/70 text-sm sm:text-base mb-2">
                    {user.university_name}
                  </p>
                )}

                {/* Telegram Username */}
                {user.telegram_username || telegramData?.username ? (
                  <p className="text-white/50 text-xs sm:text-sm mb-3">
                    @{user.telegram_username || telegramData?.username}
                  </p>
                ) : null}

                {/* Verification Status Badge */}
                {getVerificationStatusBadge()}

                {/* Member Since */}
                {user.created_at && (
                  <p className="text-white/50 text-xs sm:text-sm mb-6">
                    Member since {formatDate(user.created_at)}
                  </p>
                )}

                {/* Login Button */}
                <button
                  onClick={handleLogin}
                  className="w-full bg-pink-200 text-rose-600 text-base sm:text-lg font-bold py-3 sm:py-4 px-4 rounded-lg hover:scale-105 transition-transform duration-200 active:scale-95 shadow-xl mb-3"
                >
                  Login as {user.first_name || 'User'}
                </button>

                {/* Not you? Option */}
                <button
                  onClick={handleNewRegistration}
                  className="text-white/70 hover:text-white text-xs sm:text-sm transition"
                >
                  Not you? Register a new account
                </button>
              </div>
            </div>
          ) : (
            /* No Account Found - Show Option to Register */
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl sm:rounded-2xl p-8 sm:p-10 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              
              <h2 className="text-white text-xl sm:text-2xl font-bold mb-2">Welcome to MatchMaker!</h2>
              <p className="text-white/70 text-sm sm:text-base mb-6 sm:mb-8">
                We couldn't find an account linked to your Telegram. Create one to start connecting with verified students.
              </p>

              <button
                onClick={handleNewRegistration}
                className="w-full bg-pink-200 text-rose-600 text-base sm:text-lg font-bold py-3 sm:py-4 px-4 rounded-lg hover:scale-105 transition-transform duration-200 active:scale-95 shadow-xl"
              >
                Register New Account
              </button>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="mt-8 sm:mt-10 flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-white/80 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100K+ matches</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
              </svg>
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span>Active community</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;