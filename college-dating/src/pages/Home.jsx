// pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import { 
  HiOutlineHeart, 
  HiOutlineUserGroup, 
  HiOutlineChat,
  HiOutlineSparkles,
  HiOutlineLocationMarker,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineCamera,
  HiOutlineBookOpen,
  HiOutlineFire,
  HiOutlineStar,
  HiOutlineTrendingUp,
  HiOutlineUser
} from 'react-icons/hi';

const Home = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [trendingUsers, setTrendingUsers] = useState([]);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    dailyMatches: 0,
    totalUniversities: 0
  });

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      // Get current user from localStorage
      const telegramData = JSON.parse(localStorage.getItem('telegramUser') || '{}');
      const telegramId = telegramData.id || localStorage.getItem('telegramId');
      
      if (!telegramId) {
        navigate('/');
        return;
      }

      // Fetch current user data
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (userError) throw userError;
      
      setCurrentUser(user);
      
      // Fetch potential matches (opposite gender)
      await fetchPotentialMatches(user);
      await fetchTrendingUsers(user);
      await fetchNearbyUsers(user);
      await fetchStats();

    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPotentialMatches = async (user) => {
    try {
      // Get opposite gender
      const oppositeGender = user.gender === 'male' ? 'female' : 'male';
      
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          telegram_id,
          first_name,
          last_name,
          gender,
          photo_url,
          verification_status,
          university_name,
          graduation_year,
          interests,
          bio,
          location
        `)
        .eq('gender', oppositeGender)
        .eq('verification_status', 'verified')
        .neq('telegram_id', user.telegram_id) // Exclude current user
        .limit(8);

      if (error) throw error;
      
      // Format the data
      const formattedMatches = data.map(match => ({
        id: match.id,
        name: `${match.first_name || ''} ${match.last_name || ''}`.trim() || 'User',
        age: calculateAge(match.graduation_year),
        university: match.university_name || 'University not specified',
        image: match.photo_url || 'https://via.placeholder.com/400',
        interests: match.interests || ['Student'],
        verified: match.verification_status === 'verified',
        bio: match.bio || 'Looking to connect with fellow students',
        location: match.location || 'Campus'
      }));

      setPotentialMatches(formattedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchTrendingUsers = async (user) => {
    try {
      // Get most active/recently verified users
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, photo_url, university_name, verification_status')
        .eq('verification_status', 'verified')
        .neq('telegram_id', user.telegram_id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Add random like counts for trending effect
      const formattedTrending = data.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
        university: user.university_name || 'University',
        image: user.photo_url || 'https://via.placeholder.com/400',
        likes: Math.floor(Math.random() * 200) + 50 // Random likes between 50-250
      }));

      setTrendingUsers(formattedTrending);
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  };

  const fetchNearbyUsers = async (user) => {
    try {
      // For now, just get some random verified users
      // You can add location-based filtering later
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, photo_url, university_name, location')
        .eq('verification_status', 'verified')
        .neq('telegram_id', user.telegram_id)
        .limit(4);

      if (error) throw error;

      const formattedNearby = data.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
        university: user.university_name || 'University',
        image: user.photo_url || 'https://via.placeholder.com/400',
        distance: user.location || 'Nearby'
      }));

      setNearbyUsers(formattedNearby);
    } catch (error) {
      console.error('Error fetching nearby:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total verified users
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified');

      if (usersError) throw usersError;

      // Get unique universities count
      const { data: universities, error: uniError } = await supabase
        .from('users')
        .select('university_name')
        .eq('verification_status', 'verified')
        .not('university_name', 'is', null);

      if (uniError) throw uniError;

      const uniqueUniversities = [...new Set(universities.map(u => u.university_name))].length;

      setStats({
        totalUsers: totalUsers || 0,
        dailyMatches: Math.floor(Math.random() * 100) + 50, // Random for now
        totalUniversities: uniqueUniversities || 0
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const calculateAge = (graduationYear) => {
    // Rough estimate: assume started at 18, graduating in 4 years
    const currentYear = new Date().getFullYear();
    const graduationAge = 22; // Average graduation age
    const yearsUntilGraduation = graduationYear - currentYear;
    return graduationAge - yearsUntilGraduation;
  };

  const getCardStyles = () => {
    return isDark
      ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
      : 'bg-white border-gray-100 hover:border-rose-200';
  };

  const getTextStyles = () => {
    return isDark ? 'text-white' : 'text-gray-900';
  };

  const getSubtextStyles = () => {
    return isDark ? 'text-gray-400' : 'text-gray-500';
  };

  const getSectionTitleStyles = () => {
    return isDark ? 'text-white' : 'text-gray-900';
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className={`animate-spin rounded-full h-16 w-16 border-4 ${
            isDark ? 'border-gray-700 border-t-rose-500' : 'border-gray-200 border-t-rose-500'
          }`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Navbar />
      
      {/* Main Content */}
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Hero Section with Greeting */}
        <div className="mb-10">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${getTextStyles()}`}>
            Welcome back, <span className="text-rose-500">{currentUser?.first_name || 'User'}</span>
          </h1>
          <p className={`text-lg max-w-2xl ${getSubtextStyles()}`}>
            Discover verified students who share your interests and ambitions.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Verified Students', value: stats.totalUsers.toLocaleString(), icon: HiOutlineUserGroup, change: 'Active' },
            { label: 'Daily Matches', value: stats.dailyMatches, icon: HiOutlineHeart, change: 'Today' },
            { label: 'Universities', value: stats.totalUniversities, icon: HiOutlineAcademicCap, change: 'Partnered' },
            { label: 'Your Type', value: currentUser?.gender === 'male' ? 'Women' : 'Men', icon: HiOutlineUser, change: 'Showing' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${getCardStyles()}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-8 h-8 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className={`text-2xl font-bold ${getTextStyles()}`}>{stat.value}</div>
                <div className={`text-sm ${getSubtextStyles()}`}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Potential Matches Section (Opposite Gender) */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <HiOutlineHeart className={`w-6 h-6 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
              <h2 className={`text-2xl font-bold ${getSectionTitleStyles()}`}>
                {currentUser?.gender === 'male' ? 'Women' : 'Men'} Near You
              </h2>
            </div>
            <button className={`text-sm font-medium flex items-center gap-1 ${
              isDark ? 'text-rose-400 hover:text-rose-300' : 'text-rose-500 hover:text-rose-600'
            }`}>
              View All <HiOutlineTrendingUp className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {potentialMatches.map((user) => (
              <div
                key={user.id}
                className={`rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer ${getCardStyles()}`}
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <div className="relative">
                  <img src={user.image} alt={user.name} className="w-full h-56 object-cover" />
                  {user.verified && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      ✓ Verified
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className={`text-lg font-semibold mb-1 ${getTextStyles()}`}>{user.name}</h3>
                  <p className={`text-sm mb-2 flex items-center gap-1 ${getSubtextStyles()}`}>
                    <HiOutlineAcademicCap className="w-4 h-4" />
                    {user.university}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {user.interests.slice(0, 2).map((interest, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-1 rounded-full ${
                          isDark 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                  <button className={`w-full py-2 rounded-xl font-medium transition ${
                    isDark 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                      : 'bg-rose-500 hover:bg-rose-600 text-white'
                  }`}>
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Now Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <HiOutlineFire className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
            <h2 className={`text-2xl font-bold ${getSectionTitleStyles()}`}>Trending Now</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingUsers.map((user) => (
              <div
                key={user.id}
                className={`rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer ${getCardStyles()}`}
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <div className="relative">
                  <img src={user.image} alt={user.name} className="w-full h-48 object-cover" />
                  <div className="absolute top-3 right-3 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <HiOutlineHeart className="w-3 h-3" />
                    {user.likes}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className={`text-lg font-semibold mb-2 ${getTextStyles()}`}>{user.name}</h3>
                  <p className={`text-sm mb-3 flex items-center gap-1 ${getSubtextStyles()}`}>
                    <HiOutlineAcademicCap className="w-4 h-4" />
                    {user.university}
                  </p>
                  <button className={`w-full py-2 rounded-xl font-medium transition ${
                    isDark 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                      : 'bg-rose-500 hover:bg-rose-600 text-white'
                  }`}>
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Nearby Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <HiOutlineLocationMarker className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            <h2 className={`text-2xl font-bold ${getSectionTitleStyles()}`}>Nearby Students</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {nearbyUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 rounded-2xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl cursor-pointer ${getCardStyles()}`}
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <img src={user.image} alt={user.name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className={`font-semibold ${getTextStyles()}`}>{user.name}</h3>
                  <p className={`text-sm mb-1 flex items-center gap-1 ${getSubtextStyles()}`}>
                    <HiOutlineAcademicCap className="w-4 h-4" />
                    {user.university}
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${getSubtextStyles()}`}>
                    <HiOutlineLocationMarker className="w-3 h-3" />
                    {user.distance}
                  </p>
                </div>
                <button className={`p-2 rounded-full transition ${
                  isDark 
                    ? 'hover:bg-gray-700 text-rose-400' 
                    : 'hover:bg-rose-50 text-rose-500'
                }`}>
                  <HiOutlineHeart className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Interests Categories */}
        <section className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${getSectionTitleStyles()}`}>Browse by Interest</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Photography', icon: HiOutlineCamera, color: 'purple' },
              { name: 'Travel', icon: HiOutlineLocationMarker, color: 'blue' },
              { name: 'Reading', icon: HiOutlineBookOpen, color: 'green' },
              { name: 'Fitness', icon: HiOutlineBriefcase, color: 'orange' },
              { name: 'Music', icon: HiOutlineSparkles, color: 'pink' },
              { name: 'Art', icon: HiOutlineHeart, color: 'red' },
            ].map((category, index) => {
              const Icon = category.icon;
              return (
                <button
                  key={index}
                  className={`p-4 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 flex flex-col items-center gap-2 ${
                    isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-rose-50'
                  }`}
                >
                  <Icon className={`w-6 h-6 text-${category.color}-500`} />
                  <span className={`text-sm font-medium ${getTextStyles()}`}>{category.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;