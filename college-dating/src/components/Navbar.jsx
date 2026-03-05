// components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
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
  HiOutlineCog
} from 'react-icons/hi';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    getUserData();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScroll = () => {
    setScrolled(window.scrollY > 20);
  };

  const getUserData = async () => {
    try {
      // Get telegram data
      const telegramData = JSON.parse(localStorage.getItem('telegramUser') || '{}');
      const telegramId = telegramData.id || localStorage.getItem('telegramId');
      
      if (telegramId) {
        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name, verification_status')
          .eq('telegram_id', telegramId)
          .maybeSingle();

        if (userData) {
          setUser(userData);
          setUserName(`${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User');
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('telegramUser');
    localStorage.removeItem('telegramId');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('formData');
    setShowDropdown(false);
    setIsOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/home', icon: HiOutlineHome },
    { name: 'Matches', path: '/matches', icon: HiOutlineHeart },
    { name: 'Messages', path: '/messages', icon: HiOutlineChat },
    { name: 'Community', path: '/community', icon: HiOutlineUserGroup },
  ];

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link 
              to="/" 
              className={`text-2xl font-bold tracking-tighter transition-colors duration-300 ${
                scrolled ? 'text-rose-600' : 'text-white'
              }`}
            >
              MATCH<span className={scrolled ? 'text-pink-400' : 'text-pink-200'}>MAKER</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      scrolled
                        ? 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Right Side Icons */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Notifications */}
              <button
                className={`relative p-2 rounded-full transition-all duration-200 ${
                  scrolled
                    ? 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => navigate('/notifications')}
              >
                <HiOutlineBell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
                    scrolled
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center">
                    <HiOutlineUser className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium hidden lg:block">
                    {userName || 'Profile'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 border border-gray-100">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      <HiOutlineUser className="w-4 h-4" />
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      <HiOutlineCog className="w-4 h-4" />
                      Settings
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition"
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
                  ? 'text-gray-600 hover:bg-gray-100'
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
          className={`md:hidden fixed inset-x-0 top-[73px] bg-white shadow-xl transition-all duration-300 ease-in-out transform ${
            isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
          }`}
          style={{ maxHeight: 'calc(100vh - 73px)', overflowY: 'auto' }}
        >
          <div className="px-4 py-6 space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center">
                <HiOutlineUser className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{userName || 'Guest User'}</p>
                <p className="text-xs text-gray-500">
                  {user?.verification_status === 'verified' ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-yellow-600">Pending verification</span>
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
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Additional Links */}
            <div className="pt-4 border-t border-gray-100 space-y-1">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"
                onClick={() => setIsOpen(false)}
              >
                <HiOutlineUser className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>
              <Link
                to="/notifications"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"
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
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"
                onClick={() => setIsOpen(false)}
              >
                <HiOutlineCog className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </Link>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition w-full"
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;