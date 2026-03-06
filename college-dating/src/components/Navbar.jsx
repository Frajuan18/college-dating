// components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { 
  HiOutlineHeart, 
  HiOutlineUser, 
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineBell,
  HiOutlineChat,
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineChevronDown
} from 'react-icons/hi';

const Navbar = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    getUserData();
    
    // Add event listener for storage changes (in case user updates profile)
    window.addEventListener('storage', handleStorageChange);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleStorageChange = (e) => {
    if (e.key === 'telegramUser' || e.key === 'telegramId') {
      getUserData();
    }
  };

  const getUserData = async () => {
    try {
      // First, try to get complete user data from localStorage
      const storedTelegramUser = localStorage.getItem('telegramUser');
      
      if (storedTelegramUser && storedTelegramUser !== '{}') {
        try {
          const userData = JSON.parse(storedTelegramUser);
          console.log('Navbar: Found stored user data:', userData);
          
          // Set user state with all available data
          setUser(userData);
          
          // Set display name with priority: full_name > first_name + last_name > first_name > 'User'
          const displayName = userData.full_name || 
                             `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 
                             userData.first_name || 
                             'User';
          setUserName(displayName);
          
          // Set photo URL if available
          setUserPhoto(userData.photo_url || '');
          
          return; // Exit early if we have data from localStorage
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
        }
      }

      // Fallback: Fetch from database if localStorage data is incomplete
      const telegramId = localStorage.getItem('telegramId');
      
      if (telegramId) {
        console.log('Navbar: Fetching user data from database for telegram_id:', telegramId);
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', telegramId)
          .maybeSingle();

        if (userError) {
          console.error('Error fetching user:', userError);
          return;
        }

        if (userData) {
          console.log('Navbar: Fetched user data from database:', userData);
          
          // Set user state
          setUser(userData);
          
          // Set display name
          const displayName = userData.full_name || 
                             `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 
                             userData.first_name || 
                             'User';
          setUserName(displayName);
          
          // Set photo URL
          setUserPhoto(userData.photo_url || '');
          
          // Update localStorage with complete data for future use
          localStorage.setItem('telegramUser', JSON.stringify({
            id: userData.telegram_id,
            telegram_id: userData.telegram_id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            full_name: userData.full_name,
            photo_url: userData.photo_url,
            university_name: userData.university_name,
            department: userData.department,
            student_year: userData.student_year,
            gender: userData.gender,
            verification_status: userData.verification_status,
            bio: userData.bio,
            interests: userData.interests,
            location: userData.location
          }));
        }
      }
    } catch (error) {
      console.error('Error in getUserData:', error);
    }
  };

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('telegramUser');
    localStorage.removeItem('telegramId');
    localStorage.removeItem('lastUser');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('formData');
    
    setUser(null);
    setUserName('');
    setUserPhoto('');
    setShowDropdown(false);
    setIsOpen(false);
    
    // Navigate to login page
    navigate('/login');
  };

  // Theme-based styles
  const getNavbarStyles = () => {
    if (scrolled) {
      return isDark
        ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800'
        : 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100';
    }
    return isDark
      ? 'bg-transparent'
      : 'bg-transparent';
  };

  const getTextStyles = () => {
    if (scrolled) {
      return isDark
        ? 'text-gray-200 hover:text-white'
        : 'text-gray-700 hover:text-rose-600';
    }
    return 'text-white hover:text-white/80';
  };

  const getIconStyles = () => {
    if (scrolled) {
      return isDark
        ? 'text-gray-300 hover:text-white'
        : 'text-gray-600 hover:text-rose-600';
    }
    return 'text-white/80 hover:text-white';
  };

  const getDropdownStyles = () => {
    return isDark
      ? 'bg-gray-800 border-gray-700 shadow-xl'
      : 'bg-white border-gray-100 shadow-xl';
  };

  const navLinks = [
    { name: 'Home', path: '/home', icon: HiOutlineHome },
    { name: 'Matches', path: '/matches', icon: HiOutlineHeart },
    { name: 'Messages', path: '/messages', icon: HiOutlineChat },
    { name: 'Community', path: '/community', icon: HiOutlineUserGroup },
  ];

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${getNavbarStyles()}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className={`text-2xl font-bold tracking-tighter transition-colors duration-300 ${
                scrolled
                  ? isDark ? 'text-white' : 'text-rose-600'
                  : 'text-white'
              }`}
            >
              MATCH<span className={scrolled && !isDark ? 'text-pink-400' : 'text-pink-200'}>MAKER</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${getTextStyles()}`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Right Side Icons */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all duration-200 ${getIconStyles()}`}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <HiOutlineSun className="w-5 h-5" />
                ) : (
                  <HiOutlineMoon className="w-5 h-5" />
                )}
              </button>

              {/* Notifications */}
              <button
                className={`relative p-2 rounded-full transition-all duration-200 ${getIconStyles()}`}
                onClick={() => navigate('/notifications')}
              >
                <HiOutlineBell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
                    scrolled
                      ? isDark
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${
                    isDark ? 'bg-gray-700' : 'bg-gradient-to-r from-rose-400 to-pink-500'
                  }`}>
                    {userPhoto ? (
                      <img 
                        src={userPhoto} 
                        alt={userName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span class="text-white text-sm">' + (userName?.[0] || 'U') + '</span>';
                        }}
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {userName?.[0] || 'U'}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium hidden lg:block">
                    {userName || 'Profile'}
                  </span>
                  <HiOutlineChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-xl py-2 border ${getDropdownStyles()}`}>
                    <Link
                      to="/profile"
                      className={`flex items-center gap-2 px-4 py-2 text-sm transition ${
                        isDark
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                      onClick={() => setShowDropdown(false)}
                    >
                      <HiOutlineUser className="w-4 h-4" />
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className={`flex items-center gap-2 px-4 py-2 text-sm transition ${
                        isDark
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                      onClick={() => setShowDropdown(false)}
                    >
                      <HiOutlineCog className="w-4 h-4" />
                      Settings
                    </Link>
                    
                    {/* Theme Toggle in Dropdown */}
                    <button
                      onClick={() => {
                        toggleTheme();
                        setShowDropdown(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left transition ${
                        isDark
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                    >
                      {isDark ? (
                        <>
                          <HiOutlineSun className="w-4 h-4" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <HiOutlineMoon className="w-4 h-4" />
                          Dark Mode
                        </>
                      )}
                    </button>
                    
                    <hr className={`my-1 ${isDark ? 'border-gray-700' : 'border-gray-100'}`} />
                    
                    <button
                      onClick={handleLogout}
                      className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left transition ${
                        isDark
                          ? 'text-red-400 hover:bg-gray-700 hover:text-red-300'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <HiOutlineLogout className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled
                  ? isDark
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isOpen ? (
                <HiOutlineX className="w-6 h-6" />
              ) : (
                <HiOutlineMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed inset-x-0 top-16 transition-all duration-300 ease-in-out transform ${
            isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
          } ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-xl`}
          style={{ maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}
        >
          <div className={`px-4 py-6 space-y-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {/* User Info */}
            <div className={`flex items-center gap-3 pb-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${
                isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-rose-400 to-pink-500'
              }`}>
                {userPhoto ? (
                  <img 
                    src={userPhoto} 
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="text-white text-lg">' + (userName?.[0] || 'U') + '</span>';
                    }}
                  />
                ) : (
                  <span className="text-white text-lg font-medium">
                    {userName?.[0] || 'U'}
                  </span>
                )}
              </div>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userName || 'Guest User'}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user?.verification_status === 'verified' ? (
                    <span className="text-green-500">✓ Verified</span>
                  ) : (
                    <span className="text-yellow-500">Pending verification</span>
                  )}
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      isDark
                        ? 'hover:bg-gray-800 hover:text-white'
                        : 'hover:bg-rose-50 hover:text-rose-600'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Additional Links */}
            <div className={`pt-4 border-t space-y-1 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <Link
                to="/profile"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isDark
                    ? 'hover:bg-gray-800 hover:text-white'
                    : 'hover:bg-rose-50 hover:text-rose-600'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <HiOutlineUser className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>
              <Link
                to="/notifications"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isDark
                    ? 'hover:bg-gray-800 hover:text-white'
                    : 'hover:bg-rose-50 hover:text-rose-600'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <HiOutlineBell className="w-5 h-5" />
                <span className="font-medium">Notifications</span>
                {unreadNotifications > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
              <Link
                to="/settings"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isDark
                    ? 'hover:bg-gray-800 hover:text-white'
                    : 'hover:bg-rose-50 hover:text-rose-600'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <HiOutlineCog className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </Link>

              {/* Theme Toggle in Mobile Menu */}
              <button
                onClick={() => {
                  toggleTheme();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition w-full ${
                  isDark
                    ? 'hover:bg-gray-800 hover:text-white'
                    : 'hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                {isDark ? (
                  <>
                    <HiOutlineSun className="w-5 h-5" />
                    <span className="font-medium">Light Mode</span>
                  </>
                ) : (
                  <>
                    <HiOutlineMoon className="w-5 h-5" />
                    <span className="font-medium">Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition w-full ${
                isDark
                  ? 'text-red-400 hover:bg-gray-800 hover:text-red-300'
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <HiOutlineLogout className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 md:hidden ${
            isDark ? 'bg-black/50' : 'bg-black/20'
          } backdrop-blur-sm`}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;