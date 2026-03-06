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
    oppositeGenderCount: 0,
    totalUniversities: 0
  });

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const telegramData = JSON.parse(localStorage.getItem('telegramUser') || '{}');
      const telegramId = telegramData.id || localStorage.getItem('telegramId');
      
      if (!telegramId) {
        navigate('/');
        return;
      }

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (userError) throw userError;
      
      setCurrentUser(user);
      
      await fetchPotentialMatches(user);
      await fetchTrendingUsers(user);
      await fetchNearbyUsers(user);
      await fetchStats(user);

    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPotentialMatches = async (user) => {
    try {
      const oppositeGender = user.gender === 'male' ? 'female' : 'male';
      
      const { data, error, count } = await supabase
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
        `, { count: 'exact' })
        .eq('gender', oppositeGender)
        .eq('verification_status', 'verified')
        .neq('telegram_id', user.telegram_id)
        .limit(12);

      if (error) throw error;
      
      const formattedMatches = data.map(match => ({
        id: match.id,
        name: `${match.first_name || ''} ${match.last_name || ''}`.trim() || 'User',
        age: calculateAge(match.graduation_year),
        university: match.university_name || 'University not specified',
        image: match.photo_url || 'https://images.unsplash.com/photo-1494790108777-406d7f1f3a9f?w=400',
        interests: match.interests || ['Student', 'Friendly'],
        verified: match.verification_status === 'verified',
        bio: match.bio || 'Looking to connect with fellow students',
        location: match.location || 'On Campus'
      }));

      setPotentialMatches(formattedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchTrendingUsers = async (user) => {
    try {
      const oppositeGender = user.gender === 'male' ? 'female' : 'male';
      
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, photo_url, university_name')
        .eq('gender', oppositeGender)
        .eq('verification_status', 'verified')
        .neq('telegram_id', user.telegram_id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      const formattedTrending = data.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
        university: user.university_name || 'University',
        image: user.photo_url || 'https://images.unsplash.com/photo-1494790108777-406d7f1f3a9f?w=400',
        likes: Math.floor(Math.random() * 200) + 50
      }));

      setTrendingUsers(formattedTrending);
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  };

  const fetchNearbyUsers = async (user) => {
    try {
      const oppositeGender = user.gender === 'male' ? 'female' : 'male';
      
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, photo_url, university_name, location')
        .eq('gender', oppositeGender)
        .eq('verification_status', 'verified')
        .neq('telegram_id', user.telegram_id)
        .limit(4);

      if (error) throw error;

      const formattedNearby = data.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
        university: user.university_name || 'University',
        image: user.photo_url || 'https://images.unsplash.com/photo-1494790108777-406d7f1f3a9f?w=400',
        distance: Math.floor(Math.random() * 5) + 1 + ' miles away'
      }));

      setNearbyUsers(formattedNearby);
    } catch (error) {
      console.error('Error fetching nearby:', error);
    }
  };

  const fetchStats = async (user) => {
    try {
      const oppositeGender = user.gender === 'male' ? 'female' : 'male';
      
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified');

      const { count: oppositeGenderCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('gender', oppositeGender)
        .eq('verification_status', 'verified');

      const { data: universities } = await supabase
        .from('users')
        .select('university_name')
        .eq('verification_status', 'verified')
        .not('university_name', 'is', null);

      const uniqueUniversities = [...new Set(universities?.map(u => u.university_name) || [])].length;

      setStats({
        totalUsers: totalUsers || 0,
        oppositeGenderCount: oppositeGenderCount || 0,
        totalUniversities: uniqueUniversities || 0
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const calculateAge = (graduationYear) => {
    if (!graduationYear) return 22;
    const currentYear = new Date().getFullYear();
    return 22 - (graduationYear - currentYear);
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

  const genderText = currentUser?.gender === 'male' ? 'Women' : 'Men';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="mb-10">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${getTextStyles()}`}>
            Welcome back, <span className="text-rose-500">{currentUser?.first_name || 'User'}</span>
          </h1>
          <p className={`text-lg max-w-2xl ${getSubtextStyles()}`}>
            Discover {stats.oppositeGenderCount} verified {genderText.toLowerCase()} students near you.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Students', value: stats.totalUsers.toLocaleString(), icon: HiOutlineUserGroup },
            { label: genderText, value: stats.oppositeGenderCount.toLocaleString(), icon: HiOutlineHeart },
            { label: 'Universities', value: stats.totalUniversities, icon: HiOutlineAcademicCap },
            { label: 'Your Match %', value: '87%', icon: HiOutlineSparkles },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${getCardStyles()}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-8 h-8 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                </div>
                <div className={`text-2xl font-bold ${getTextStyles()}`}>{stat.value}</div>
                <div className={`text-sm ${getSubtextStyles()}`}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Potential Matches Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <HiOutlineHeart className={`w-6 h-6 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
              <h2 className={`text-2xl font-bold ${getTextStyles()}`}>
                {genderText} Near You
              </h2>
            </div>
            <button className={`text-sm font-medium flex items-center gap-1 ${
              isDark ? 'text-rose-400 hover:text-rose-300' : 'text-rose-500 hover:text-rose-600'
            }`}>
              View All <HiOutlineTrendingUp className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {potentialMatches.slice(0, 4).map((user) => (
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

        {/* Trending Now Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <HiOutlineFire className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
            <h2 className={`text-2xl font-bold ${getTextStyles()}`}>Popular {genderText}</h2>
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
            <h2 className={`text-2xl font-bold ${getTextStyles()}`}>{genderText} Nearby</h2>
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
      </div>
    </div>
  );
};

export default Home;