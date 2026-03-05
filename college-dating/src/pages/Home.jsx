// pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
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
  HiOutlineTrendingUp
} from 'react-icons/hi';

const Home = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [featuredMatches, setFeaturedMatches] = useState([]);
  const [trendingNow, setTrendingNow] = useState([]);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setFeaturedMatches([
        { 
          id: 1, 
          name: 'Sarah Johnson', 
          age: 24, 
          university: 'Stanford University', 
          image: 'https://images.unsplash.com/photo-1494790108777-406d7f1f3a9f?w=400',
          distance: '2 miles away',
          major: 'Computer Science',
          interests: ['Photography', 'Hiking', 'Coffee'],
          verified: true
        },
        { 
          id: 2, 
          name: 'Michael Chen', 
          age: 26, 
          university: 'MIT', 
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
          distance: '3 miles away',
          major: 'Engineering',
          interests: ['Music', 'Gaming', 'Travel'],
          verified: true
        },
        { 
          id: 3, 
          name: 'Emma Davis', 
          age: 23, 
          university: 'Harvard University', 
          image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
          distance: '1 mile away',
          major: 'Business',
          interests: ['Yoga', 'Art', 'Cooking'],
          verified: true
        },
        { 
          id: 4, 
          name: 'James Wilson', 
          age: 25, 
          university: 'UC Berkeley', 
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          distance: '4 miles away',
          major: 'Physics',
          interests: ['Chess', 'Running', 'Reading'],
          verified: true
        },
      ]);

      setTrendingNow([
        { id: 5, name: 'Olivia Martinez', age: 22, university: 'UCLA', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', likes: 234 },
        { id: 6, name: 'William Brown', age: 27, university: 'Columbia', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400', likes: 189 },
        { id: 7, name: 'Sophia Lee', age: 24, university: 'NYU', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', likes: 156 },
      ]);

      setNearbyUsers([
        { id: 8, name: 'Ethan Taylor', age: 25, university: 'USC', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400', distance: '0.5 miles' },
        { id: 9, name: 'Mia Anderson', age: 23, university: 'UCSD', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400', distance: '1.2 miles' },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

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
            Find your <span className="text-rose-500">spark</span> today
          </h1>
          <p className={`text-lg max-w-2xl ${getSubtextStyles()}`}>
            Connect with verified students who share your interests and ambitions.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Active Users', value: '10,234', icon: HiOutlineUserGroup, change: '+12%' },
            { label: 'Daily Matches', value: '567', icon: HiOutlineHeart, change: '+8%' },
            { label: 'Messages Sent', value: '45K', icon: HiOutlineChat, change: '+23%' },
            { label: 'Universities', value: '156', icon: HiOutlineAcademicCap, change: '+5' },
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
                    isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
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

        {/* Trending Now Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <HiOutlineFire className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
              <h2 className={`text-2xl font-bold ${getSectionTitleStyles()}`}>Trending Now</h2>
            </div>
            <button className={`text-sm font-medium flex items-center gap-1 ${
              isDark ? 'text-rose-400 hover:text-rose-300' : 'text-rose-500 hover:text-rose-600'
            }`}>
              View All <HiOutlineTrendingUp className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingNow.map((user) => (
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
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-lg font-semibold ${getTextStyles()}`}>{user.name}, {user.age}</h3>
                    <HiOutlineSparkles className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                  </div>
                  <p className={`text-sm mb-3 flex items-center gap-1 ${getSubtextStyles()}`}>
                    <HiOutlineAcademicCap className="w-4 h-4" />
                    {user.university}
                  </p>
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

        {/* Featured Matches Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <HiOutlineStar className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <h2 className={`text-2xl font-bold ${getSectionTitleStyles()}`}>Featured Matches</h2>
            </div>
            <button className={`text-sm font-medium ${isDark ? 'text-rose-400 hover:text-rose-300' : 'text-rose-500 hover:text-rose-600'}`}>
              See All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMatches.map((user) => (
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
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-lg font-semibold ${getTextStyles()}`}>{user.name}, {user.age}</h3>
                  </div>
                  <p className={`text-sm mb-2 flex items-center gap-1 ${getSubtextStyles()}`}>
                    <HiOutlineAcademicCap className="w-4 h-4" />
                    {user.university}
                  </p>
                  <p className={`text-xs mb-3 flex items-center gap-1 ${getSubtextStyles()}`}>
                    <HiOutlineLocationMarker className="w-3 h-3" />
                    {user.distance}
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
                    {user.interests.length > 2 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        +{user.interests.length - 2}
                      </span>
                    )}
                  </div>
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
            <h2 className={`text-2xl font-bold ${getSectionTitleStyles()}`}>Nearby You</h2>
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
                  <h3 className={`font-semibold ${getTextStyles()}`}>{user.name}, {user.age}</h3>
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
          <h2 className={`text-2xl font-bold mb-6 ${getSectionTitleStyles()}`}>Explore by Interest</h2>
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