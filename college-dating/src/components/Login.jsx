// Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const navigate = useNavigate();
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentUsers();
  }, []);

  const fetchRecentUsers = async () => {
    try {
      // Get the last logged in user from localStorage
      const lastUser = localStorage.getItem('lastUser');
      const lastUserData = lastUser ? JSON.parse(lastUser) : null;

      // Fetch verified users from database
      const { data: users, error } = await supabase
        .from('users')
        .select('id, telegram_id, first_name, last_name, full_name, photo_url, university_name, gender')
        .eq('verification_status', 'verified')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // If we have users, set them
      if (users && users.length > 0) {
        setRecentUsers(users);
      } else {
        // For demo purposes, create mock users if no real users exist
        const mockUsers = [
          {
            id: '1',
            first_name: 'Alex',
            last_name: 'Johnson',
            full_name: 'Alex Johnson',
            photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
            university_name: 'Stanford University',
            gender: 'male'
          },
          {
            id: '2',
            first_name: 'Sarah',
            last_name: 'Chen',
            full_name: 'Sarah Chen',
            photo_url: 'https://images.unsplash.com/photo-1494790108777-406d7f1f3a9f?w=200',
            university_name: 'UC Berkeley',
            gender: 'female'
          },
          {
            id: '3',
            first_name: 'Michael',
            last_name: 'Kim',
            full_name: 'Michael Kim',
            photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
            university_name: 'UCLA',
            gender: 'male'
          }
        ];
        setRecentUsers(mockUsers);
      }

      // If there was a last user, highlight it
      if (lastUserData) {
        // You could scroll to or highlight the last used account
      }

    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock users
      setRecentUsers([
        {
          id: '1',
          first_name: 'Alex',
          last_name: 'Johnson',
          full_name: 'Alex Johnson',
          photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
          university_name: 'Stanford University',
          gender: 'male'
        },
        {
          id: '2',
          first_name: 'Sarah',
          last_name: 'Chen',
          full_name: 'Sarah Chen',
          photo_url: 'https://images.unsplash.com/photo-1494790108777-406d7f1f3a9f?w=200',
          university_name: 'UC Berkeley',
          gender: 'female'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user) => {
    // Save user to localStorage
    localStorage.setItem('telegramUser', JSON.stringify({
      id: user.telegram_id || user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: `${user.first_name?.toLowerCase()}_${user.last_name?.toLowerCase()}`,
      photo_url: user.photo_url
    }));
    localStorage.setItem('telegramId', user.telegram_id || user.id);
    localStorage.setItem('lastUser', JSON.stringify(user));
    
    console.log('Logged in as:', user.full_name || `${user.first_name} ${user.last_name}`);
    
    // Redirect to home page
    navigate('/home');
  };

  const getInitials = (user) => {
    if (user.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
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
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
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
      <nav className="relative z-10 flex justify-between items-center px-6 py-6 md:px-8 lg:px-16">
        <Link to="/" className="text-white text-2xl font-bold tracking-tighter drop-shadow-lg">
          MATCH<span className="text-pink-200">MAKER</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 md:px-8 lg:px-16 py-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] mb-3 sm:mb-4 drop-shadow-lg">
              Welcome <span className="text-pink-200">back</span>
            </h1>
            <p className="text-white/90 text-base sm:text-lg md:text-xl max-w-md mx-auto leading-relaxed drop-shadow px-4">
              Choose your account to continue
            </p>
            <div className="w-20 sm:w-24 h-1 bg-pink-200 mx-auto mt-4 sm:mt-6 rounded-full" />
          </div>

          {/* Users Grid */}
          {recentUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {recentUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleLogin(user)}
                  className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-pink-200 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Profile Picture */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-3 sm:border-4 border-white/50 overflow-hidden mb-3 sm:mb-4">
                      {user.photo_url ? (
                        <img 
                          src={user.photo_url} 
                          alt={user.full_name || `${user.first_name} ${user.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold ${
                          user.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'
                        } text-white`}>
                          {getInitials(user)}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <h3 className="text-white font-semibold text-base sm:text-lg md:text-xl mb-1">
                      {user.full_name || `${user.first_name} ${user.last_name}`}
                    </h3>
                    <p className="text-white/70 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-1">
                      {user.university_name || 'University Student'}
                    </p>

                    {/* Login Button */}
                    <div className="w-full bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-medium py-2 px-3 rounded-lg group-hover:bg-pink-200 group-hover:text-rose-600 transition-all">
                      Login
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/70 text-lg">No accounts found</p>
              <p className="text-white/50 text-sm mt-2">Please register first</p>
            </div>
          )}

          {/* Help Text */}
          <div className="text-center mt-8 sm:mt-12">
            <p className="text-white/70 text-xs sm:text-sm">
              Securely login to continue finding meaningful connections
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 sm:mt-12 flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-white/80 text-xs sm:text-sm">
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